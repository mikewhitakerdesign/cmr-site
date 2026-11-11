import { OFFICIAL_RUNS_ON_HOLD } from "@/lib/permit-hold";

/**
 * Legal documents: Website Terms of Use, Privacy Policy and Participation
 * Guidelines. Three separate documents (CMR-JOIN-001, Owner decision).
 *
 * Source: the Owner's CMR-JOIN-001 content handoff (revision 6, 2026-11-09),
 * published on the Owner's instruction of 2026-11-09. Reviewer-only bracket notes
 * from the drafts are not shown to the public; each one is recorded as an open
 * item in .aiom/work/implement-cmr-join-page.md. Statements about site behavior
 * (cookies, storage, analytics, third-party requests, how forms are processed)
 * are limited to what the audit in that Work Item verified.
 *
 * An entry set to `null` renders an "in review" notice, is not indexed and keeps
 * its footer link hidden, so any one document can be withdrawn by setting it back
 * to `null`.
 *
 * Do not add privacy claims, retention periods, insurance, permit or affiliation
 * statements that the Owner has not approved.
 */
export type LegalParagraph = string | { h3: string };
export type LegalSection = { heading: string; paragraphs: LegalParagraph[] };
export type LegalDoc = {
  title: string;
  /** Shown as "Effective" (policies) or "Last updated". */
  updated: string;
  dateLabel?: "Effective" | "Last updated";
  intro?: string[];
  sections: LegalSection[];
  /** Version identifier shown with the date (documents that are versioned, such as the waiver). */
  version?: string;
  /** A short notice shown above the document while it is a draft. */
  draftNote?: string;
};

const DATE = "November 9, 2026";

export const privacyPolicy: LegalDoc | null = {
  title: "Privacy Policy",
  updated: DATE,
  dateLabel: "Effective",
  intro: [
    "Chicago Mountain Runners (CMR) is an informal running community based in Chicago, Illinois.",
    "We collect a small amount of information to operate the website, respond to questions, and keep club members informed. This policy explains what we collect, why we collect it, and how you can manage your information.",
  ],
  sections: [
    {
      heading: "1. Information you provide",
      paragraphs: [
        { h3: "Joining the club" },
        "When you join CMR, we collect your first name, email address, confirmation that you are at least 18 years old, and your acceptance of the Participation Waiver and Release of Liability, recorded with the waiver version and the time you accepted it.",
        "We use that information to maintain a membership contact list and send announcements about group runs, schedule changes, and occasional community news.",
        { h3: "Asking a question" },
        "When you use our Questions form, we process the contact information and message you provide so we can review and respond to your inquiry.",
        "Submitting a question does not enroll you in club communications.",
        "Please avoid submitting medical information, financial details, or other sensitive personal information through either form.",
      ],
    },
    {
      heading: "2. How forms are processed",
      paragraphs: [
        "CMR uses Formspree, a third-party form-processing service, for membership signups and questions.",
        "When you submit either form, your browser sends the information directly to Formspree for processing and delivery to us. The website itself does not store form submissions. Formspree may also process technical information needed to operate its service, protect against spam, and maintain security.",
        "We may retain administrative copies of submissions and correspondence in access-restricted records.",
      ],
    },
    {
      heading: "3. Website hosting and technical information",
      paragraphs: [
        "Our website is hosted by Vercel.",
        "When you access the website, hosting infrastructure may process technical information associated with your request, such as your IP address, browser information, requested pages, and timestamps. This information supports website delivery, security, troubleshooting, and infrastructure operations.",
        "Cookies, storage, analytics, and tracking: as of the effective date of this policy, the CMR website does not set cookies, and it does not use analytics, advertising, or tracking tools, tag managers, or embedded third-party content. Its pages load from the CMR website itself, not from other sites.",
        "If you use the Pause motion or Resume motion control in the footer, the site saves that choice (\"on\" or \"off\") in your browser's local storage so it can remember it. That value stays on your device and is not sent to us. If you only browse, nothing is stored.",
      ],
    },
    {
      heading: "4. Emails and club announcements",
      paragraphs: [
        "Joining CMR includes emails about upcoming runs, schedule changes, and occasional community news.",
        "We do not require a paid membership or attendance commitment.",
        "You can unsubscribe from club announcements at any time by contacting us through the Questions form on our website and asking to stop receiving club emails. We handle these requests by hand, and we do not currently offer a one-click unsubscribe link. We will keep the information reasonably necessary to honor your request and avoid sending unwanted messages.",
        "If we adopt a dedicated email service in the future, we will update this policy to identify the relevant processing arrangements.",
      ],
    },
    {
      heading: "5. Sharing and service providers",
      paragraphs: [
        "We use service providers to host the website, process forms, and support club administration and communications.",
        "We share information with those providers as necessary to operate these functions.",
        "We may also disclose information when required by law, to respond to lawful requests, or when reasonably necessary to protect the rights, safety, or security of CMR and others.",
        "We do not use club membership information as a public member directory.",
      ],
    },
    {
      heading: "6. How long information is kept",
      paragraphs: [
        "We retain membership contact information while it is needed to administer membership and club communications.",
        "If you unsubscribe or ask us to delete your information, we will address the request and may retain a limited record of your communication preference or other information when reasonably necessary for legal, security, or administrative purposes.",
        "Questions and related correspondence are retained only as long as reasonably necessary for responding, maintaining appropriate records, or addressing legal obligations.",
        "Retention periods in third-party services may differ from our own administrative records.",
      ],
    },
    {
      heading: "7. Security",
      paragraphs: [
        "We take reasonable steps to limit access to membership information and administrative records.",
        "Information is handled through third-party infrastructure and services, and no internet-based system can be guaranteed completely secure.",
      ],
    },
    {
      heading: "8. Your choices",
      paragraphs: [
        "You may contact us to request access to, correction of, or deletion of the personal information we maintain about you, subject to applicable legal and operational requirements.",
        "You may also unsubscribe from club announcements without losing the ability to attend regular open group runs.",
      ],
    },
    {
      heading: "9. External services and social platforms",
      paragraphs: [
        "CMR may link to Instagram, Strava, mapping providers, and other websites.",
        "When you choose to visit those services, their own terms and privacy policies apply.",
      ],
    },
    {
      heading: "10. Children",
      paragraphs: [
        "CMR membership and organized club runs are intended for adults age 18 and older.",
        "We do not intentionally solicit membership information from children. If we learn that a child has submitted personal information through our membership form, we will take appropriate steps to address it.",
      ],
    },
    {
      heading: "11. Changes to this policy",
      paragraphs: ["We may revise this policy as the website, club operations, or service providers change. The effective date will identify the current version."],
    },
    {
      heading: "12. Contact",
      paragraphs: [
        "For privacy questions, correction requests, deletion requests, or communication preferences, use the Questions form on the CMR website.",
        "Website operator: Chicago Mountain Runners, an informal running community based in Chicago, Illinois.",
      ],
    },
  ],
};

export const websiteTerms: LegalDoc | null = {
  title: "Terms of Use",
  updated: DATE,
  dateLabel: "Effective",
  intro: [
    "Welcome to Chicago Mountain Runners (CMR). We're an informal running community based in Chicago, Illinois. These Terms explain how our website and community information may be used.",
  ],
  sections: [
    {
      heading: "1. Using this website",
      paragraphs: [
        "You may browse the website, explore Chicago's hills, learn about the club, and submit requests to join or contact us.",
        "Please use the website lawfully and don't attempt to interfere with its operation, security, or availability.",
      ],
    },
    {
      heading: "2. Membership",
      paragraphs: [
        "CMR membership is free and intended for adults 18 years of age or older. Joining connects you to the community and includes email announcements about runs, schedule changes, and occasional club news.",
        "Membership is optional for attending regular club runs. There are no dues, minimum pace requirements, or attendance commitments.",
        "You may unsubscribe from club emails at any time. CMR may decline or discontinue membership or participation when reasonably necessary to address misconduct, safety concerns, or abuse.",
      ],
    },
    {
      heading: "3. Running and physical activity",
      paragraphs: [
        "Running involves physical exertion and risks, including injury, illness, falls, collisions, environmental hazards, and changing weather.",
        "CMR organizes informal, voluntary activities. Information provided on the website is general information, not individualized coaching, medical advice, or a guarantee of safety.",
        "You are responsible for evaluating your ability and readiness before participating. Please review our Participation Guidelines.",
        "These Terms are not a participant liability waiver or release. Separate participation requirements may apply to organized CMR activities.",
      ],
    },
    {
      heading: "4. Schedules, locations, and information",
      paragraphs: [
        "We make reasonable efforts to keep information accurate, but schedules, meeting locations, routes, terrain descriptions, and other details may change.",
        "CMR may modify, postpone, or cancel activities. The Running Calendar is the authoritative source for official CMR schedules, but participants should remain attentive to conditions and updates.",
        "Descriptions of hills, distances, elevations, and routes may be approximate." +
          (OFFICIAL_RUNS_ON_HOLD ? " Official CMR meetups are currently on hold while park-use requirements are reviewed." : ""),
      ],
    },
    {
      heading: "5. Community conduct",
      paragraphs: [
        "We expect respectful and lawful behavior toward other runners, organizers, and members of the public.",
        "CMR leadership may warn, remove, or exclude individuals from club-organized activities when reasonably necessary to address unsafe, threatening, harassing, discriminatory, or seriously disruptive behavior.",
        "CMR does not control general public access to parks or other public spaces.",
      ],
    },
    {
      heading: "6. Content and intellectual property",
      paragraphs: [
        "Unless otherwise stated, the original writing, graphics, photographs, branding, and other materials on this website belong to the website operator or are used with permission.",
        "You may share links to our public pages. You may not reproduce protected materials commercially or represent yourself as affiliated with CMR without appropriate permission.",
        "Third-party names, trademarks, photographs, and linked resources remain the property of their respective owners.",
      ],
    },
    {
      heading: "7. Third-party websites",
      paragraphs: [
        "Our website may link to external services, including social platforms, mapping services, and other resources. We do not control their content, availability, privacy practices, or terms.",
      ],
    },
    {
      heading: "8. Website availability and limitations",
      paragraphs: [
        "We provide the website and its informational content on an as-available basis. We do not guarantee uninterrupted access or that every piece of information will always be complete, current, or error-free.",
        "To the extent permitted by applicable law, CMR disclaims warranties regarding website availability and informational accuracy and is not responsible for losses arising solely from reliance on inaccurate or unavailable website information.",
        "Nothing in these Terms excludes rights or liabilities that cannot lawfully be excluded.",
      ],
    },
    {
      heading: "9. Privacy",
      paragraphs: ["Our Privacy Policy explains how information submitted through the website is collected, used, and handled."],
    },
    {
      heading: "10. Changes",
      paragraphs: ["We may revise these Terms as the club and website evolve. The effective date will identify the current version. Material changes will be communicated when appropriate."],
    },
    {
      heading: "11. Governing law",
      paragraphs: ["These Terms are governed by the laws of Illinois, subject to applicable law and any mandatory rights or jurisdictional requirements."],
    },
    {
      heading: "12. Contact",
      paragraphs: [
        "Questions about these Terms may be submitted through the Questions form on the CMR website.",
        "Website operator: Chicago Mountain Runners, an informal running community based in Chicago, Illinois.",
      ],
    },
  ],
};

export const participationGuidelines: LegalDoc | null = {
  title: "Participation Guidelines",
  updated: DATE,
  dateLabel: "Last updated",
  intro: [
    "Chicago Mountain Runners brings adults together for informal runs and hill workouts around Chicago. We want people to feel welcome, exercise good judgment, and look out for one another. These guidelines explain what to expect and how to participate responsibly.",
  ],
  sections: [
    {
      heading: "1. Who can participate",
      paragraphs: [
        "CMR membership and organized club runs are open to adults age 18 and older. Membership is free, and joining is not required to attend a regular club run. Participation is voluntary. Suggested workouts are optional: choose the pace, distance, repetitions, and effort that work for you.",
      ],
    },
    {
      heading: "2. Know your limits and come prepared",
      paragraphs: [
        "Running and hill workouts involve physical exertion and risks. Assess your own fitness, health, experience, readiness, and ability to handle the conditions before participating. Wear appropriate shoes and clothing, bring the hydration and supplies you need, and take breaks or stop when appropriate. If you are unsure whether an activity is appropriate for you, seek advice from a qualified health professional.",
        "CMR does not provide individualized medical advice, coaching, fitness assessments, or continuous supervision.",
      ],
    },
    {
      heading: "3. Terrain, weather, and shared spaces",
      paragraphs: [
        "Activities may involve grass, trails, pavement, slopes, uneven or slippery ground, obstacles, traffic crossings, other park users, and changing weather. Pay attention to your surroundings, choose a safe level of effort, and adjust or stop when conditions call for it.",
        "Respect park property, follow applicable rules and lawful directions, and share public spaces courteously. Do not obstruct paths or interfere with other park users.",
      ],
    },
    {
      heading: "4. How meetups work",
      paragraphs: [
        "A designated organizer typically gives a brief welcome, explains a suggested workout, identifies relevant known hazards, and reviews expectations. This does not mean an organizer can identify every hazard, track every participant, guarantee a pace group, or remain with everyone throughout the activity.",
        "You may adjust or end your workout at any time. If you leave early, please let the organizer know when practical. This is a courtesy, not a formal check-out system.",
        "If an organizer cannot attend, we will try to designate a replacement; otherwise, the official CMR activity will be canceled.",
      ],
    },
    {
      heading: "5. Respect the community",
      paragraphs: [
        "Treat fellow participants, organizers, park visitors, and the public with respect. Harassment, discrimination, intimidation, threats, deliberate interference, and reckless or seriously unsafe behavior are not acceptable.",
        "Depending on the circumstances, CMR leadership may issue a warning, ask someone to leave a club-organized activity, or exclude someone from future CMR activities. This does not restrict anyone's independent lawful access to public parks.",
      ],
    },
    {
      heading: "6. Schedule changes and emergencies",
      paragraphs: [
        "CMR may change, postpone, or cancel an official meetup because of weather, terrain conditions, organizer availability, permit requirements, safety concerns, or other circumstances. The website Running Calendar is our official source of published schedule information; information may change.",
        "If you become unwell or injured, stop and seek appropriate help. Alert the organizer or another person when possible. Call 911 for serious or potentially life-threatening emergencies. CMR does not operate a medical service or guarantee emergency assistance.",
      ],
    },
    {
      heading: "7. Participation risks and separate agreements",
      paragraphs: [
        "By choosing to participate, you acknowledge that running and other physical activity involve risks, including injury or illness. You remain responsible for your own participation decisions and for exercising reasonable care toward others.",
        "These guidelines describe practical expectations. They do not replace any separate participation agreement or liability release that may be required, and they do not eliminate legal duties or rights that cannot lawfully be excluded.",
      ],
    },
    {
      heading: "8. Questions and concerns",
      paragraphs: [
        "Use CMR's Questions form to report concerns or ask about these guidelines. For an immediate emergency, contact emergency services rather than relying on a website message.",
      ],
    },
  ],
};

/**
 * Participation Waiver and Release of Liability, CMR-WAIVER-002. PROPOSED REVISION (v1.1 branch) for
 * Owner approval and Illinois attorney review. It revises CMR-WAIVER-001 (the "Participant Waiver and
 * Assumption of Risk"), keeping that text's structure and adding coverage for organizer instructions and
 * authority, personal property, ongoing participation, severability and photography/media. It is original
 * CMR text, not copied from any template. It is NOT attorney-approved and must not be treated as an
 * enforceable waiver. Open legal questions (entity, minors, media, enforceability) are listed in
 * .aiom/work/implement-cmr-v1-1-refinements.md, not shown on the page.
 * Set to `null` to withdraw it (the page then shows the "in review" notice).
 *
 * No entity, insurance, permit or nonprofit status is stated or implied: CMR is
 * described only as an independent, free, informal adult running community based in Illinois.
 */
export const participantWaiver: LegalDoc | null = {
  title: "Participation Waiver and Release of Liability",
  updated: "to be set when approved",
  dateLabel: "Effective",
  version: "CMR-WAIVER-002",
  draftNote:
    "Draft for review. This waiver has not been reviewed or approved by an attorney, and accepting it does not guarantee any legal protection for you or for CMR.",
  intro: [
    "Please read this carefully. It describes the risks of taking part in Chicago Mountain Runners activities and asks you to accept those risks and to give up certain legal claims. Sections 6 and 7 are the ones that affect your legal rights.",
    "Chicago Mountain Runners (CMR) is an independent, free, informal running community for adults, based in Illinois. In this document, “CMR Parties” means CMR, its founder, its organizers and its volunteers, and each of their agents and representatives. “CMR Activities” means the group runs, hill repeats, workouts, meetups and related events that CMR announces or organizes.",
  ],
  sections: [
    {
      heading: "1. Who may participate",
      paragraphs: [
        "CMR Activities are for adults age 18 or older. CMR does not accept minors as participants. If you are under 18, do not take part in CMR Activities and do not accept this waiver.",
        "By accepting this waiver you confirm that you are at least 18 years old.",
      ],
    },
    {
      heading: "2. Participation is voluntary",
      paragraphs: [
        "You choose whether to take part in any CMR Activity, and you may stop, slow down, skip a repeat or leave at any time. Nobody is required to attend, to keep a pace, or to complete a workout. Suggestions from organizers or other participants are only suggestions.",
      ],
    },
    {
      heading: "3. What CMR Activities involve",
      paragraphs: [
        "CMR Activities include running, jogging and walking, hill repeats, climbing and descending hills, stairs and steep inclines, trail running, group training, and related activities such as warm-ups, cool-downs, travel between locations and time spent socializing before or after a run.",
        "Activities take place outdoors in public parks, roads, paths and other public places that CMR does not own or control.",
      ],
    },
    {
      heading: "4. Risks you understand",
      paragraphs: [
        "Running and training on hills are strenuous and carry real risks. These include, without limitation: falls and collisions, especially on steep climbs and fast descents; uneven, steep, loose or slippery ground; roots, rocks, holes, curbs, stairs, railings, debris and other natural and man-made hazards; ice, snow, mud, rain and wet or dry grass; heat, humidity, cold, wind, lightning and other weather; poor light and low visibility; traffic and vehicles at crossings and on roads and shared paths; cyclists, pedestrians, dogs, wildlife and other park users; and the actions of other participants.",
        "Physical exertion can also cause muscle, joint and bone injuries, overexertion, dehydration, heat or cold illness, cardiac events and other medical problems. Any of these risks can result in serious injury, illness, permanent disability or death.",
        "Some risks are unknown or cannot be foreseen. Organizers and volunteers are people who run, not medical professionals, safety officers or guides, and they cannot remove these risks.",
      ],
    },
    {
      heading: "5. Your responsibilities",
      paragraphs: [
        "You are responsible for deciding whether you are healthy and fit enough to take part, and for consulting a physician if you are unsure. You are responsible for your own judgment and safety, including your pace, your footing, your gear, your hydration, and whether conditions are safe for you on a given day.",
        "You agree to follow applicable laws and park rules, to watch for traffic and other people, to treat other people with respect, to follow reasonable instructions from CMR organizers, and to stop and get help if you feel unwell or injured.",
        "CMR organizers may cancel, move, shorten, modify or stop any CMR Activity at any time, including for weather, safety, park rules or the availability of organizers, and may ask a participant to leave if their conduct is unsafe.",
      ],
    },
    {
      heading: "6. Assumption of risk",
      paragraphs: [
        "You voluntarily accept and assume the inherent and ordinary risks of taking part in CMR Activities, including the risks described in Section 4, whether or not they are listed there.",
      ],
    },
    {
      heading: "7. Release of liability",
      paragraphs: [
        { h3: "What you give up" },
        "To the fullest extent Illinois law allows, you release and agree not to sue the CMR Parties for injury, illness, death, or loss or damage to property that arises from your participation in CMR Activities, including claims that the injury or loss was caused by the ordinary negligence (a failure to use reasonable care) of a CMR Party.",
        "You understand that you are giving up the right to bring a claim for ordinary negligence against the CMR Parties. This release is intended to apply to you, your heirs, executors and legal representatives.",
        { h3: "What this release does not do" },
        "This release does not apply to, and CMR does not ask you to give up, claims for willful or wanton misconduct, gross negligence, intentional harm, or anything else that Illinois law does not allow to be released.",
      ],
    },
    {
      heading: "8. Medical help, costs and property",
      paragraphs: [
        "CMR does not provide medical supervision, medical advice, first aid services or emergency response. If you are hurt or become ill, you or another person may call 911 or seek medical help, and you agree that you are responsible for the cost of any medical treatment, ambulance or other emergency service you receive.",
        "You are responsible for your own phone, keys, wallet, vehicle, clothing, gear and other belongings. CMR Parties do not hold or guard them and, to the extent Illinois law allows, are not responsible for their loss, theft or damage.",
        "Nothing in this waiver or on this website states or suggests that CMR carries insurance that covers participants. Please rely on your own health and accident insurance.",
      ],
    },
    {
      heading: "9. Photography and media",
      paragraphs: [
        "Accepting this waiver does not give CMR permission to publish photos, video or audio of you. If CMR wants to publish identifiable images of you, it will ask for your separate permission first, and you may say no and still take part in CMR Activities.",
        "CMR Activities take place in public places, where other people, including park visitors, may take photos or video that CMR does not control.",
      ],
    },
    {
      heading: "10. Your acknowledgment",
      paragraphs: [
        "By checking the box on the Join form, or by otherwise indicating your acceptance, you state that you are 18 or older, that you have read this waiver, that you understand the risks of taking part, that you have had the chance to ask questions, and that you accept these terms voluntarily.",
        "Your acceptance applies to your participation in CMR Activities from the time you accept, including activities you attend later, until CMR publishes a new version of this waiver and asks you to accept it.",
        "When you accept this waiver through the Join form, CMR keeps a record of your acceptance that includes the waiver version, the time of acceptance, and the name and email address you provided. That record is kept for CMR's own administration. It does not by itself guarantee that this waiver is enforceable.",
      ],
    },
    {
      heading: "11. Governing law and severability",
      paragraphs: [
        "This waiver is governed by the laws of the State of Illinois, without regard to conflict-of-law rules.",
        "If any part of this waiver is found to be unenforceable, that part is limited to the extent necessary and the rest of the waiver stays in effect to the extent the law permits.",
      ],
    },
    {
      heading: "12. Versions and changes",
      paragraphs: [
        "This waiver has a version number and an effective date, shown at the top of the page. CMR may publish a new version from time to time. Your acceptance applies to the version you accepted, as recorded when you joined.",
      ],
    },
    {
      heading: "13. Questions",
      paragraphs: [
        "If you have questions about this waiver, use CMR's Questions form before you accept it. You may also wish to speak with a lawyer of your choice.",
      ],
    },
  ],
};
