import Layout from "../../components/Layout";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [books, setBooks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/author/books");
      if (res.ok) setBooks(await res.json());
    }
    load();
  }, []);

  if (!session) return <Layout><p>Please sign in</p></Layout>;

  return (
    <Layout>
      <div className="card">
        <h2>Author dashboard</h2>
        <p>Signed in as {session.user?.email}</p>
        <h3>Your books</h3>
        {books.length === 0 && <p>No books yet</p>}
        {books.map(b => (
          <div key={b.id} className="card">
            <h4>{b.title}</h4>
            <div>Price: ${(b.priceCents/100).toFixed(2)}</div>
            <div>Status: {b.status}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
