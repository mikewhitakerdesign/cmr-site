import Link from "next/link";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/calendar", label: "Calendar" },
  { href: "/hills", label: "Hills" },
  { href: "/join", label: "Join" },
];

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Chicago Mountain Runners
        </Link>
        <nav className="flex gap-5 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
