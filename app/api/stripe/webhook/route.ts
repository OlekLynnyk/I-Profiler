import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerClientForApi } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { isValidPackageType } from "@/types/plan";
import { updateUserLimits } from "@/lib/updateUserLimits";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  // ✅ заменили создание supabase client на server-side
  const supabase = await createServerClientForApi();

  const rawBody = await req.text();
  const sig = (await headers()).get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook verification failed:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription, supabase);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Error handling webhook:", err);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }

  return NextResponse.json({ message: "✅ OK" });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  console.log("✅ Webhook received for checkout.session.completed");

  const userId = session.metadata?.user_id;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.warn("⚠️ Missing metadata.user_id or subscriptionId");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await updateUserSubscription(userId, subscription, supabase);
  await initializeCurrentPeriodStartIfMissing(userId, supabase);
}

async function handleSubscriptionChange(
  subscription: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  const customerId = subscription.customer as string;

  const { data, error } = await supabase
    .from("user_subscription")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error || !data?.user_id) {
    console.error("❌ Не найден user_id по customerId:", customerId);
    return;
  }

  await updateUserSubscription(data.user_id, subscription, supabase);
}

async function updateUserSubscription(
  userId: string,
  subscription: Stripe.Subscription,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("⚠️ Subscription has no priceId");
    return;
  }

  const plan = PLAN_MAPPING[priceId] ?? null;

  if (!plan || !isValidPackageType(plan)) {
    console.warn("⚠️ Invalid plan mapped from priceId:", priceId);
    return;
  }

  const item = subscription.items.data?.[0];
  const timestamp = item?.current_period_end;
  const subscriptionEndsAt = timestamp
    ? new Date(timestamp * 1000).toISOString()
    : new Date().toISOString();

  const { error } = await supabase
    .from("user_subscription")
    .upsert(
      {
        user_id: userId,
        stripe_customer_id: subscription.customer as string,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        status: normalizeStatus(subscription.status),
        subscription_ends_at: subscriptionEndsAt,
        plan,
        package_type: plan,
        active: true,
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("❌ Failed to upsert user subscription:", error.message);
  } else {
    await updateUserLimits(supabase, userId, plan);
  }
}

async function initializeCurrentPeriodStartIfMissing(
  userId: string,
  supabase: Awaited<ReturnType<typeof createServerClientForApi>>
) {
  const { data, error } = await supabase
    .from("user_subscription")
    .select("current_period_start")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("❌ Failed to fetch current_period_start:", error.message);
    return;
  }

  if (!data?.current_period_start) {
    const { error: updateError } = await supabase
      .from("user_subscription")
      .update({ current_period_start: new Date().toISOString() })
      .eq("user_id", userId);

    if (updateError) {
      console.error("❌ Failed to initialize current_period_start:", updateError.message);
    }
  }
}

function normalizeStatus(status: string): "active" | "canceled" | "incomplete" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    default:
      return "canceled";
  }
}

const PLAN_MAPPING: Record<string, string> = {
  "price_1RQYE4AGnqjZyhfAY8kOMZwm": "Smarter",
  "price_1RQYEXAGnqjZyhfAryCzNkqV": "Business",
  "freemium": "Freemium",
};
