import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";
import slugify from "slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const session = await getSession({ req });
  if (!session || session.user?.role !== "AUTHOR") return res.status(403).json({ error: "Unauthorized" });

  const { title, description, priceCents, coverKey, bookKey } = req.body;
  if (!title || !priceCents) return res.status(400).json({ error: "Missing" });

  const user = await prisma.user.findUnique({ where: { email: session.user?.email } });
  if (!user) return res.status(400).json({ error: "User not found" });
  const author = await prisma.authorProfile.findUnique({ where: { userId: user.id } });
  if (!author) return res.status(400).json({ error: "Author profile required" });

  const slug = slugify(title, { lower: true, strict: true }) + "-" + Date.now().toString().slice(-4);

  const book = await prisma.book.create({
    data: {
      title,
      slug,
      description,
      priceCents,
      coverKey,
      authorId: author.id,
      status: "PUBLISHED",
      publishedAt: new Date()
    }
  });

  if (bookKey) {
    await prisma.file.create({
      data: {
        bookId: book.id,
        s3Key: bookKey,
        format: bookKey.split(".").pop() ?? "pdf",
        sizeBytes: 0
      }
    });
  }

  res.status(201).json({ book });
}
