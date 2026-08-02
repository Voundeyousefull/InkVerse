import type { NextApiRequest, NextApiResponse } from "next";
import { getPresignedUploadUrl } from "../../lib/s3";
import { getSession } from "next-auth/react";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { filename, contentType, folder = "books" } = req.body;
  if (!filename || !contentType) return res.status(400).json({ error: "Missing filename or contentType" });

  const timestamp = Date.now();
  const email = session.user?.email?.replace(/[^a-z0-9.-_@]/gi, "_") ?? "user";
  const key = `${folder}/${email}/${timestamp}-${filename}`;

  try {
    const url = await getPresignedUploadUrl(key, contentType);
    res.status(200).json({ url, key });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Could not create upload URL" });
  }
}
