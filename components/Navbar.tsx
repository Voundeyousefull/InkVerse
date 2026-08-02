import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <header className="header card">
      <div>
        <Link href="/"><strong>Bookstore</strong></Link>
      </div>
      <nav>
        <Link href="/">Home</Link>{" "}
        <Link href="/books/create" style={{ marginLeft: 12 }}>Sell a book</Link>{" "}
        {session?.user ? (
          <>
            {session.user.role === "AUTHOR" && <Link href="/author/dashboard" style={{ marginLeft: 12 }}>Dashboard</Link>}
            <span style={{ marginLeft: 12 }}>{session.user.email}</span>
            <button onClick={() => signOut()} className="btn" style={{ marginLeft: 8 }}>Sign out</button>
          </>
        ) : (
          <Link href="/api/auth/signin" style={{ marginLeft: 12 }}>Sign in</Link>
        )}
      </nav>
    </header>
  );
}
