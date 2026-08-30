export const metadata = { title: "About — Chicago Mountain Runners" };

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        Chicago Mountain Runners is a running club built around finding
        elevation in a very flat city. We organize recurring hill-focused
        group runs and help runners discover and train on Chicago&apos;s
        artificial hills — parking garage ramps, stadium stairs, and the odd
        landfill.
      </p>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        Placeholder copy — replace with the real About page content.
      </p>
    </div>
  );
}
