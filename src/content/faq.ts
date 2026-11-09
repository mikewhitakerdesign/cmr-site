import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";

/**
 * FAQ copy: the Owner's CMR-JOIN-001 content handoff (revision 6, 2026-11-09),
 * four categories, questions and answers as supplied. Two answers carry the
 * permit-hold qualifier while `OFFICIAL_RUNS_ON_HOLD` is on
 * (src/lib/permit-hold.ts) and drop it when the hold is lifted. The unsubscribe
 * answer states the manual process (Questions form), not a one-click link.
 *
 * Not yet added, pending operational approval (per the handoff): "Will you take
 * photos at runs?" and "Do I need to sign a participation waiver?".
 */
export type FaqItem = { q: string; a: string; more?: { label: string; href: string } };
export type FaqCategory = { id: string; number: string; title: string; items: FaqItem[] };

export const FAQ_LABEL = "GOOD QUESTIONS.";
export const FAQ_TITLE = "FREQUENTLY ASKED.";
export const FAQ_INTRO =
  "Everything you need to know about running with Chicago Mountain Runners. Except why we keep running up the same hill. We're still working on that one.";

const HOLD = OFFICIAL_RUNS_ON_HOLD;

export const faq: FaqCategory[] = [
  {
    id: "the-club",
    number: "01",
    title: "The Club",
    items: [
      {
        q: "What is Chicago Mountain Runners?",
        a: "A free, informal running community finding elevation in a city that doesn't have much of it. We get together for hill workouts, group runs, and the occasional questionable use of the word mountain.",
      },
      {
        q: "What does joining the club mean?",
        a: "Joining connects you to the CMR community and signs you up for emails about runs, schedule changes, and occasional club news. There are no membership fees or attendance requirements.",
      },
      {
        q: "Do I need to join before attending a run?",
        a:
          "Nope. Our regular group runs are open to adults 18 and older, whether or not they've joined." +
          (HOLD ? " Official CMR meetups remain on hold while park-use requirements are reviewed." : ""),
      },
      {
        q: "Does membership cost anything?",
        a: "No. Membership is free. Regular group meetups are intended to be free when they are authorized to launch. Any separately priced special activity, if ever introduced, will be clearly identified.",
      },
      {
        q: "Is there an age requirement?",
        a: "Yes. You must be at least 18 to join CMR or participate in an organized club run.",
      },
    ],
  },
  {
    id: "running-with-us",
    number: "02",
    title: "Running With Us",
    items: [
      {
        q: "Are beginners welcome?",
        a: "Absolutely. You don't need experience with hill repeats, trail running, or ultramarathons. You should, however, be comfortable exercising independently and choosing an effort appropriate for your abilities.",
      },
      {
        q: "How fast do I need to be?",
        a: "There is no minimum pace. Fast, slow, somewhere in between. You're welcome to run at whatever pace works for you.",
      },
      {
        q: "Do I have to complete every repeat?",
        a: "No. Suggested workouts are exactly that: suggestions. You decide how many repeats to run, how long to stay, and when you're finished. The hill isn't going anywhere.",
      },
      {
        q: "Are the runs coached?",
        a: "No. CMR organizes informal meetups rather than providing coaching or personal training. An organizer will welcome the group, describe the suggested workout, and point out relevant known hazards and expectations.",
      },
      {
        q: "Will someone run with me the whole time?",
        a: "Not necessarily. Everyone chooses their own pace and distance. Runs aren't individually supervised, and we don't guarantee a pace group or someone to accompany every participant.",
      },
      {
        q: "What should I bring?",
        a: "Running shoes, weather-appropriate clothing, water, and anything else you need to run comfortably and safely. Some locations may have limited access to bathrooms or water.",
      },
      {
        q: "Can I bring a friend?",
        a: "Of course. Friends must be at least 18 and follow the same participation guidelines. They don't have to join the club first.",
      },
      {
        q: "Can I leave early?",
        a: "Yes. Come for the workout you want to run. If an organizer is present, we encourage you to let them know before heading out, when practical.",
      },
    ],
  },
  {
    id: "schedules-and-safety",
    number: "03",
    title: "Schedules & Safety",
    items: [
      {
        q: "Where and when does CMR meet?",
        a: HOLD
          ? "The Running Calendar will be the official source for scheduled runs, meeting locations, and details. For now, official meetups are on hold while we review park-use requirements. The public Hills directory remains available for independent exploration."
          : "The Running Calendar is the official source for scheduled runs, meeting locations, and details. The public Hills directory is available for independent exploration.",
      },
      {
        q: "What happens if the weather is bad?",
        a: "We may modify, postpone, or cancel runs when conditions are unsafe. Check the calendar before heading out, and use your own judgment about whether conditions are appropriate for you.",
      },
      {
        q: "What happens if an organizer can't attend?",
        a: "We'll try to arrange a replacement. If no organizer is available, we'll cancel the official CMR meetup and update the calendar.",
      },
      {
        q: "Who is responsible for my safety?",
        a: "Running is a physical activity with inherent risks. You're responsible for assessing your fitness, conditions, and readiness, choosing an appropriate effort, and exercising reasonable care for yourself and others. Club organizers also have responsibilities under applicable law; these guidelines do not eliminate those responsibilities.",
      },
      {
        q: "What if I get injured or don't feel well?",
        a: "Stop exercising and seek appropriate assistance. Tell someone nearby or the organizer when possible. For a serious or potentially life-threatening emergency, call 911. CMR does not provide medical services or guaranteed individual supervision.",
      },
      {
        q: "Are there rules for participating?",
        a: "Yes. Respect other runners, park visitors, public property, and applicable park rules. Unsafe, threatening, harassing, or discriminatory conduct isn't welcome.",
        more: { label: "Read the Participation Guidelines", href: "/participation-guidelines" },
      },
    ],
  },
  {
    id: "staying-connected",
    number: "04",
    title: "Staying Connected",
    items: [
      {
        q: "How are schedule changes announced?",
        a: "The Running Calendar is the official schedule. We may also share updates by email and through CMR's social channels, but you should check the calendar for the latest published information.",
      },
      {
        q: "What kind of emails will I receive?",
        a: "Announcements about upcoming runs, changes to the schedule, and occasional community news. We don't have a fixed publishing schedule.",
      },
      {
        q: "Can I stop receiving emails?",
        a: "Yes. Use the Questions form on our website and ask to be taken off the club email list. We handle these requests by hand, and there's no one-click unsubscribe link. Unsubscribing doesn't affect your ability to attend open group runs.",
        more: { label: "How we handle your information", href: "/privacy" },
      },
      {
        q: "How can I contact CMR?",
        a: "Use the Questions form on our website (the Questions? button on every page). It's separate from the Join form and doesn't automatically sign you up for club announcements.",
      },
    ],
  },
];
