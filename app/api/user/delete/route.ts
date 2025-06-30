import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // ✅ создаём клиент на паблик-ключе (для getUser(token))
  const supabaseUserClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const {
    data: { user },
    error: authError,
  } = await supabaseUserClient.auth.getUser(token);

  if (authError || !user) {
    console.error('❌ Supabase auth error:', authError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ создаём админ-клиент для изменений в БД
  const supabaseAdminClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // ✅ ставим soft delete флаг вместо удаления
  const { error: updateProfileError } = await supabaseAdminClient
    .from('profiles')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (updateProfileError) {
    console.error('❌ Failed to soft delete profile:', updateProfileError);
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }

  // ✅ Отправляем письмо пользователю
  try {
    await sendAccountDeletionEmail({
      email: user.email ?? '',
      fullName: user.user_metadata?.full_name || '',
    });
  } catch (emailError) {
    console.error('❌ Failed to send deletion email:', emailError);
    // Email ошибка не блокирует API → но можно возвращать warning
    return NextResponse.json(
      {
        success: true,
        warning: 'Account soft deleted, but failed to send email.',
      },
      { status: 200 }
    );
  }

  // ✅ Выходим из аккаунта
  // можно signOut вызывать на клиенте после успешного ответа

  return NextResponse.json({ success: true });
}

/**
 * Отправка письма пользователю о том, что его аккаунт soft deleted.
 * Реализуй эту функцию через Sendgrid, Resend, AWS SES — любой твой email провайдер.
 */
async function sendAccountDeletionEmail({
  email,
  fullName,
}: {
  email: string;
  fullName: string;
}) {
  // TODO:
  // - подключить твой email-провайдер (например Resend, AWS SES)
  // - сформировать письмо

  console.log(
    `Simulate sending email to ${email} — Account deleted with retention 90 days.`
  );

  // Пример payload для email:
  const message = `
    Hi ${fullName || 'there'},
    
    Your account was deleted. 
    
    You have 90 days to recover your account before all data is permanently erased.
    
    If this was a mistake, please contact our support team.
  `;

  // пример с Resend
  /*
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'support@yourdomain.com',
    to: email,
    subject: 'Your account was deleted',
    text: message,
  });
  */

  return;
}
