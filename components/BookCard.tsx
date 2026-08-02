import Link from "next/link";

export default function BookCard({ book }: any) {
  return (
    <div className="card">
      <h3><Link href={`/books/${book.slug}`}>{book.title}</Link></h3>
      <p>{book.description?.slice(0, 160)}</p>
      <div>Price: ${(book.priceCents / 100).toFixed(2)}</div>
    </div>
  );
}
