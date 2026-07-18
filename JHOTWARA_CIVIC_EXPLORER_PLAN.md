# Jhotwara Civic Explorer — Phase 1 plan

## Product decision

Phase 1 is a **read-only, no-login civic-information app**. It replaces report creation as the first public experience. Firebase Authentication, the reporting workflow, media uploads, API sync, and the database remain implemented but hidden until a later release.

The app is useful immediately after installation: it is bundled with a reviewed Jhotwara dataset and does not require an account or server connection. The web version stores no civic profile or report data.

## First-run flow

1. Welcome to CivicPulse.
2. Show scope selectors, fixed initially to **Rajasthan → Jaipur → Jhotwara (AC-46)**.
3. “Explore Jhotwara” opens the constituency map and ward directory.
4. A resident selects a ward from the map/directory.
5. Ward detail presents:
   - ward number and verified boundary status;
   - councillor/parshad profile, party and contact details only after verification;
   - construction works and tenders linked to their primary government source;
   - work purpose, road/locality, value when published, dates, and source-provided status.

## Data rules

- The app must never invent a ward boundary, councillor, contact number, political affiliation, tender value, road, or work status.
- Every public record has `sourceUrl`, `sourceLabel`, `sourceCheckedAt`, and a scope label: **ward**, **Jhotwara Zone**, or **constituency**.
- “Tender published”, “awarded”, and “work completed” are distinct statuses. The app may only display the status actually supported by its source.
- A tender may be displayed for a zone/constituency without assigning it to a ward. Ward assignment requires an official location or reviewed mapping evidence.
- Ward polygons are imported only from an official JMC/Election Department GIS, KML, shapefile, or digitised official boundary map reviewed by a human. Until then, selection is provided by ward directory—not fabricated shapes.

## Verified sources identified

- The Election Department of Rajasthan publishes the official **Jhotwara AC-46** map.
- The JMC official 91-ward map lists **Jhotwara wards 23–37**.
- JMC tender notices and the Rajasthan eProcurement portal are authoritative tender sources.

## Offline data model

```text
Constituency(id, name, assemblyNumber, state, city, mapCenter, source)
Ward(id, number, name?, boundaryGeoJson?, boundaryStatus, councillor?, source)
Councillor(wardId, name, party?, phone?, term?, source, checkedAt)
Tender(id, title, authority, scope, wardIds[], roadOrLocality?, purpose,
       publishedDate?, closingDate?, status, sourceUrl, checkedAt)
Work(id, tenderId?, title, scope, roadOrLocality?, purpose, startDate?,
     expectedCompletionDate?, status, sourceUrl, checkedAt)
```

## Delivery phases

1. **Now:** offline selector, constituency map shell, 15-ward directory, ward-detail screen, transparent source/status placeholders, Jhotwara-wide verified tender cards.
2. **Data onboarding:** import and review official ward polygons; populate current councillor records from a dated official list; map only evidence-backed tenders/works to wards.
3. **Publishing process:** lightweight reviewed data updates, data refresh/version banner, source expiry warnings, Hindi content, search/filter by ward/status/work type.
4. **Later:** optional reports, authentication, private uploads, and remote sync become a separate opt-in Civic Reports feature.

## Acceptance criteria for Phase 1

- A new user reaches the Jhotwara explorer without login, backend, Firebase, or permissions.
- All 15 configured wards can be selected and open a ward-information screen.
- Every displayed tender/work has an authoritative source link and labelled scope/status.
- Unverified councillor/boundary information is visibly unavailable, never guessed.
- The same journey compiles for Android and Expo Web.
