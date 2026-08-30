// Third-party embedded newsletter signup (e.g. Mailchimp/ConvertKit), per the
// Owner-authorized v1 scope: CMR's own systems never receive or store the
// raw email address. Set NEXT_PUBLIC_NEWSLETTER_EMBED_URL to the real
// provider embed URL once an account exists; until then this renders a
// placeholder instead of a broken or fabricated form.
export default function NewsletterSignup() {
  const embedUrl = process.env.NEXT_PUBLIC_NEWSLETTER_EMBED_URL;

  if (!embedUrl) {
    return (
      <div className="rounded border border-dashed border-black/20 p-4 text-sm text-zinc-600 dark:border-white/20 dark:text-zinc-400">
        Newsletter signup coming soon — waiting on a real embed URL
        (NEXT_PUBLIC_NEWSLETTER_EMBED_URL) from the chosen provider.
      </div>
    );
  }

  return (
    <iframe
      src={embedUrl}
      title="Newsletter signup"
      className="h-40 w-full max-w-md border-0"
    />
  );
}
