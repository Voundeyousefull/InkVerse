import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-08-01" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { items, successUrl, cancelUrl } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: "Bad items" });

  // Map items to stripe line items; attach metadata (bookId)
  const line_items = items.map((i: any) => ({
    price_data: {
      currency: "usd",
      product_data: { name: i.title },
      unit_amount: i.priceCents
    },
    quantity: i.qty ?? 1,
    metadata: { bookId: i.bookId ?? "" }
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error("Stripe create-checkout failed", err);
    res.status(500).json({ error: "Checkout creation failed" });
  }
}
