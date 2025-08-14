import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { PACKAGE_LIMITS } from '@/types/plan';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '').trim();
  const agreedHeader = req.headers.get('x-agreed-to-terms');
  const agreedToTerms = agreedHeader === 'true';

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: Missing access token' }, { status: 401 });
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.id) {
    return NextResponse.json({ error: 'Unauthorized: Invalid token or no user' }, { status: 401 });
  }

  // ♻️ Reactivation for soft-deleted accounts
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_deleted')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.warn('❌ Failed to check profile soft-delete state:', profileError);
    } else if (profile?.is_deleted) {
      const { error: reactivateError } = await supabase
        .from('profiles')
        .update({ is_deleted: false, deleted_at: null })
        .eq('id', user.id);

      if (reactivateError) {
        console.warn('❌ Failed to reactivate profile:', reactivateError);
      } else {
        console.log('✅ Reactivated soft-deleted profile');
      }

      const { error: subReactivateError } = await supabase
        .from('user_subscription')
        .update({ status: 'active' })
        .eq('user_id', user.id)
        .eq('status', 'cancelled');

      if (subReactivateError) {
        console.warn('❌ Failed to reactivate subscription:', subReactivateError);
      } else {
        console.log('✅ Reactivated cancelled subscription');
      }
    }
  } catch (e) {
    console.error('❌ Error during account reactivation check:', e);
  }

  // ✅ Профиль (вручную)
  try {
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, agreed_to_terms')
      .eq('id', user.id)
      .maybeSingle();

    if (profileCheckError) {
      console.warn('❌ Profile select error:', profileCheckError);
    } else if (!existingProfile) {
      const { error: insertError } = await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'user',
          email_verified: Boolean(user.email_confirmed_at),
          agreed_to_terms: agreedToTerms,
        },
      ]);

      if (insertError) {
        console.warn('❌ Insert profile failed:', insertError);
      } else {
        console.log('✅ Profile inserted');
      }
    } else if (agreedToTerms && !existingProfile.agreed_to_terms) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ agreed_to_terms: true })
        .eq('id', user.id);

      if (updateError) {
        console.warn('❌ Failed to update agreed_to_terms:', updateError);
      } else {
        console.log('✅ agreed_to_terms updated to true');
      }
    }
  } catch (e) {
    console.error('❌ Profile init logic failed:', e);
  }

  // ✅ Лимиты
  const freemiumLimits = PACKAGE_LIMITS.Freemium;
  const now = new Date();

  try {
    const { data: existingLimits } = await supabase
      .from('user_limits')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingLimits) {
      const { error: insertError } = await supabase.from('user_limits').insert([
        {
          user_id: user.id,
          plan: 'Freemium',
          used_today: 0,
          used_monthly: 0,
          daily_limit: freemiumLimits.dailyGenerations,
          monthly_limit: freemiumLimits.requestsPerMonth,
          limit_reset_at: now.toISOString(),
          monthly_reset_at: now.toISOString(),
          active: false,
        },
      ]);

      if (insertError) {
        console.warn('❌ user_limits insert error:', insertError);
      } else {
        console.log('✅ Inserted user_limits');
      }
    }
  } catch (e) {
    console.error('❌ user_limits logic failed:', e);
  }

  // ✅ Подписка
  try {
    const { data: existingSub } = await supabase
      .from('user_subscription')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingSub) {
      const { error: insertError } = await supabase.from('user_subscription').insert([
        {
          user_id: user.id,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          stripe_price_id: 'freemium',
          package_type: 'Freemium',
          status: 'active',
          plan: 'Freemium',
          subscription_ends_at: null,
          current_period_start: now.toISOString(),
          created_at: now.toISOString(),
        },
      ]);

      if (insertError) {
        console.warn('❌ user_subscription insert error:', insertError);
      } else {
        console.log('✅ Inserted user_subscription');
      }
    }
  } catch (e) {
    console.error('❌ user_subscription logic failed:', e);
  }

  return NextResponse.json({ success: true, initialized: true });
}
