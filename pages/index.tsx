import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";
import Layout from "../components/Layout";
import BookCard from "../components/BookCard";

export default function Home({ books }: any) {
  return (
    <Layout>
      <h1>Latest books</h1>
      {books.length === 0 && <p className="card">No books yet — authors can <a href="/books/create">upload</a>.</p>}
      {books.map((b: any) => <BookCard key={b.id} book={b} />)}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const books = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" }
  });
  return { props: { books: JSON.parse(JSON.stringify(books)) } };
};
