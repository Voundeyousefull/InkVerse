import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password, name, asAuthor } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "User exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: asAuthor ? "AUTHOR" : "CUSTOMER" }
  });

  if (asAuthor) {
    await prisma.authorProfile.create({ data: { userId: user.id } });
  }

  res.status(201).json({ ok: true });
}
