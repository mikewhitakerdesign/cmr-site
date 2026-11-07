import { socialLinks } from "@/lib/social";

export const metadata = { title: "Join — Chicago Mountain Runners" };

export default function JoinPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Join Us</h1>
      <p className="max-w-xl text-muted-foreground">
        No membership fees, no sign-up form, no app to download — just show
        up. Check the calendar for the next run and follow along on
        Instagram and Strava.
      </p>
      {(socialLinks.instagram || socialLinks.strava) && (
        <div className="flex gap-4 text-sm font-medium">
          {socialLinks.instagram && (
            <a href={socialLinks.instagram} className="underline">
              Instagram
            </a>
          )}
          {socialLinks.strava && (
            <a href={socialLinks.strava} className="underline">
              Strava
            </a>
          )}
        </div>
      )}
    </div>
  );
}
