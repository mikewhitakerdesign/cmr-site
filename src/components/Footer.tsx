import { socialLinks } from "@/lib/social";
import NewsletterSignup from "./NewsletterSignup";

export default function Footer() {
  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-10 text-sm">
        <div>
          <p className="mb-2 font-medium">Get the newsletter</p>
          <NewsletterSignup />
        </div>
        <div className="flex gap-4 text-zinc-600 dark:text-zinc-400">
          <a href={socialLinks.instagram} className="hover:underline">
            Instagram
          </a>
          <a href={socialLinks.strava} className="hover:underline">
            Strava
          </a>
        </div>
        <p className="text-zinc-500 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} Chicago Mountain Runners
        </p>
      </div>
    </footer>
  );
}
