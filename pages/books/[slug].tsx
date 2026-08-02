import { GetServerSideProps } from "next";
import { prisma } from "../../lib/prisma";
import Layout from "../../components/Layout";

export default function BookPage({ book }: any) {
  async function buy() {
    const res = await fetch("/api/stripe/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ title: book.title, priceCents: book.priceCents, qty: 1, bookId: book.id }],
        successUrl: window.location.origin + "/success",
        cancelUrl: window.location.origin + "/books/" + book.slug
      })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Could not create checkout session");
  }

  if (!book) return <Layout><p>Not found</p></Layout>;

  return (
    <Layout>
      <article className="card">
        <h1>{book.title}</h1>
        <p>{book.description}</p>
        <p>Price: ${(book.priceCents/100).toFixed(2)}</p>
        <button onClick={buy} className="btn">Buy</button>
      </article>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const book = await prisma.book.findUnique({ where: { slug } });
  return { props: { book: book ? JSON.parse(JSON.stringify(book)) : null } };
};
