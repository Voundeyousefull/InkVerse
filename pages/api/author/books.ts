import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).end();

  const user = await prisma.user.findUnique({ where: { email: session.user?.email } });
  if (!user) return res.status(404).end();

  const author = await prisma.authorProfile.findUnique({ where: { userId: user.id } });
  if (!author) return res.status(404).end();

  const books = await prisma.book.findMany({ where: { authorId: author.id } });
  res.status(200).json(books);
}
