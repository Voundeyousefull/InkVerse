import { useState } from "react";
import Layout from "../../components/Layout";
import { useSession } from "next-auth/react";

export default function CreateBook() {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("9.99");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);

  async function upload(file: File, folder = "books") {
    const resp = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type, folder })
    });
    const data = await resp.json();
    const put = await fetch(data.url, { method: "PUT", body: file });
    if (!put.ok) throw new Error("Upload failed");
    return data.key;
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    if (!session) {
      alert("Please sign in as an author.");
      return;
    }
    try {
      let coverKey: string | undefined;
      let bookKey: string | undefined;
      if (coverFile) coverKey = await upload(coverFile, "covers");
      if (bookFile) bookKey = await upload(bookFile, "books");
      const res = await fetch("/api/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description: desc, priceCents: Math.round(parseFloat(price) * 100), coverKey, bookKey
        })
      });
      if (res.ok) {
        alert("Book created");
        window.location.href = "/";
      } else {
        alert("Error creating book");
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <Layout>
      <div className="card">
        <h2>Upload a book</h2>
        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          <label>Description</label>
          <textarea className="input" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <label>Price (USD)</label>
          <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} />
          <label>Cover image (jpg/png)</label>
          <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
          <label>Book file (pdf/epub)</label>
          <input type="file" accept=".pdf,.epub" onChange={(e) => setBookFile(e.target.files?.[0] ?? null)} />
          <div style={{ marginTop: 12 }}>
            <button className="btn" type="submit">Create</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
