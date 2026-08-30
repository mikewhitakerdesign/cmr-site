---
seed_version: '0.1'
project:
  name: Chicago Mountain Runners
  intent: >-
    A website and digital home for Chicago Mountain Runners, a Chicago running
    club built around finding elevation in a very flat city. The club organizes
    recurring hill-focused group runs and helps runners discover and train on
    Chicago's artificial hills. Eventual scope includes a running calendar and
    workout details, hill profiles with elevation/repeat information, club
    membership, branded merchandise, articles, community elevation tracking,
    member features, and CMR-created races. Brand is simple, minimalist,
    matter-of-fact, witty, and slightly sarcastic — the humor comes from calling
    ourselves Mountain Runners in a city without mountains, and shouldn't be
    over-explained. Owner wants to start simple and grow the product
    deliberately rather than building everything as MVP.
owner:
  identity: Mike Whitaker
existing_state_assessment:
  performed: true
  performed_at: '2026-08-21T03:50:06.764Z'
lifecycle_position: scoped
signals:
  repository_backed:
    value: 'true'
    provenance: directly-inspected
    rationale: 'cmr-site already exists as an initialized, empty git repository.'
  software_producing:
    value: 'true'
    provenance: owner-stated
    rationale: Owner is asking for a website to be built.
  ui_bearing:
    value: 'true'
    provenance: owner-stated
    rationale: A public-facing website is the whole point of the project.
  externally_acting:
    value: 'true'
    provenance: owner-confirmed
    rationale: >-
      v1 scope now includes newsletter signup via a third-party embedded form
      (e.g. Mailchimp/ConvertKit) plus outbound links to Instagram/Strava.
      The embedded signup form is the only actual data exchange across the
      project boundary; no other external action is in v1 scope.
  persistent_state_dependent:
    value: 'true'
    provenance: owner-confirmed
    rationale: >-
      v1 itself (not just the later roadmap) now includes a running
      calendar/run details and individual hill profiles, which are
      structured, evolving content rather than a byproduct of a code change.
  data_sensitive:
    value: 'false'
    provenance: owner-confirmed
    rationale: >-
      Owner chose the third-party-embedded-form option for newsletter
      signup specifically so CMR's own systems never receive or store raw
      subscriber PII. Revisit if a self-hosted signup form is chosen later.
  regulated_high_risk_possible:
    value: 'false'
    provenance: ai-inferred
    rationale: >-
      No obvious regulated domain; a running club is not healthcare or
      financial-services activity, and any future payment handling would go
      through a third-party processor rather than being handled directly.
  long_running_continuous:
    value: 'true'
    provenance: owner-stated
    rationale: >-
      The club and its recurring group runs are an ongoing concern, not a
      one-off delivery.
  content_heavy_narrative_heavy:
    value: 'true'
    provenance: owner-stated
    rationale: 'Brand voice, hill profiles, and articles are central to the product.'
consequence_confirmations:
  consequential_external_action:
    value: 'yes'
    provenance: owner-confirmed
    rationale: >-
      Owner authorized one specific, bounded external action for v1: a
      third-party embedded newsletter signup form (e.g. Mailchimp/
      ConvertKit) plus static outbound links to Instagram/Strava. No
      payments, no custom email sending, no other third-party API calls, and
      no Strava API integration are authorized for v1 — accounts, RSVP/
      attendance, member dashboard, automated activity tracking, Strava
      integration, commerce, paid membership, and race functionality are all
      explicitly out of v1.
  sensitive_or_high_consequence_data:
    value: 'no'
    provenance: owner-confirmed
    rationale: >-
      Owner chose the third-party-embedded-form option for newsletter
      signup specifically so CMR's own systems never receive or store raw
      subscriber PII. Revisit this confirmation if a self-hosted signup form
      is chosen later.
bootstrap:
  ready: true
  unresolved_items: []
  next_governed_action: >-
    Next.js v1 scaffold is complete (see .aiom/work/scaffold-cmr-v1-nextjs.md)
    with placeholder hill/run content and social links. Remaining before
    launch: author real content (hills, runs, copy, social handles), choose
    and connect an actual newsletter provider, and Owner-authorize
    deployment to Vercel.
---
## Context

Owner wants to start simple and grow the CMR product deliberately, rather than treating every eventual feature (calendar, membership, merch, community tracking, CMR races) as part of the first increment.

## Existing-State Assessment

Inspected /Users/michaelwhitaker/Development/cmr-site: an empty, already git-initialized directory with no README, package manifest, or existing .aiom/ state.

## v1 Scope Decision (2026-08-20)

Owner decided v1 page/content scope: Home, About, Running Calendar/upcoming
runs with run detail pages, Chicago hills overview with individual hill
profiles (elevation/repeat information), basic Join/community information,
Instagram/Strava outbound links, and newsletter signup.

Explicitly out of v1: accounts, RSVP/attendance, member dashboard, automated
activity tracking, Strava API integration, custom commerce, paid membership
infrastructure, and race functionality.

Owner decided initial tech stack/hosting: Next.js on Vercel.

Owner decided newsletter signup mechanism: a third-party embedded form (e.g.
Mailchimp/ConvertKit) rather than a custom self-hosted form — CMR's own
systems do not directly receive or store subscriber PII under this
approach.
