import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";

export const config = { api: { bodyParser: false } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-08-01" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const buf = await buffer(req);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig!, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      // Fetch a full session with line items
      const full = await stripe.checkout.sessions.retrieve(session.id as string, { expand: ["line_items", "line_items.data.price.product"] });
      const customerEmail = full.customer_details?.email;
      if (!customerEmail) return res.status(200).end();
      const user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!user) {
        // optionally create guest user here
        return res.status(200).end();
      }

      const amount = full.amount_total ?? 0;

      // Create order and items
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          totalCents: amount,
          stripePaymentId: full.payment_intent as string
        }
      });

      const lineItems = (full.line_items?.data ?? []) as Stripe.LineItem[];
      for (const li of lineItems) {
        const bookId = li.price?.metadata?.bookId ?? null;
        const qty = li.quantity ?? 1;
        const price = (li.amount_subtotal ?? li.amount_total ?? 0);
        if (bookId) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              bookId: bookId,
              priceCents: price,
              qty: qty
            }
          });
        }
      }
    } catch (err: any) {
      console.error("Error processing checkout.session.completed:", err);
    }
  }

  res.status(200).json({ received: true });
}
