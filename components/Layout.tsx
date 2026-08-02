import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="container">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
