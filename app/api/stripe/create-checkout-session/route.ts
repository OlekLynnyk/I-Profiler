import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

type PlanType = 'smarter' | 'business';

export async function POST(req: Request) {
  const cookieStore = cookies(); // no await here
  const user_id = (await cookieStore).get("user_id")?.value;

  if (!user_id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();

  const plans = {
    smarter: { name: "Smarter Plan", amount: 1 },
    business: { name: "Business Plan", amount: 1 },
  };

  const selectedPlan = plans[plan as PlanType];

  if (!selectedPlan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: selectedPlan.name },
          unit_amount: selectedPlan.amount,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: { user_id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
