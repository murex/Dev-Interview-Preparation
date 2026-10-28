# Murex preparation tracker

A local tracker for Murex study topics, assessments, interview feedback, and learning sources.

## Run

Requires Node.js 20 or newer. No dependencies or installation are needed.

```sh
cd learning-tracker
npm start
```

Open **http://localhost:4173**. The server listens only on this machine (`127.0.0.1`). Nothing is deployed or synchronized to a hosted service.

If that port is in use:

```sh
PREPBOARD_PORT=4174 npm start
```

## What’s included

- Separate Java (148 topics) and C++ (157 topics) plans generated from the repository’s guides, including the 19 practice exercises per track.
- Overall progress and category completion counts. Group topics by priority, status, or category, or use the list view. Move cards by dragging or use the status and details controls.
- Completion checkboxes, in-progress status, custom topics/categories, search, filtering, sorting, and optional target dates.
- An editable details panel on **every** topic and all seven hiring checkpoints, with autosaved feedback, notes, source links, and dates.
- An archive with restore, and JSON backup download and import with validation.
- System fonts, local assets, and no third-party scripts, requests, analytics, or external font downloads. Reference links open only when clicked.

## Saved progress

Progress saves automatically in local storage on this browser and origin. Keep using the same hostname and port to see the same data. `localhost:4173` and `127.0.0.1:4173` have separate storage. Clearing browser site data clears the tracker. Use **Backup & restore** to retain a portable copy or move between browsers.

Both language tracks have independent learning progress. The hiring journey is shared, so switching tracks keeps application and interview feedback together. All progress starts at zero.

Java SQL essentials are supplementary topics based on the README’s SQL test section; the other seeded topics, exercises, and resource links come from `JAVA.md` and `CPP.md`. Regenerate the seed after guide changes with:

```sh
python3 generate-content.py
```

Existing browser data is kept when the seed changes. Export a backup before intentionally starting a fresh plan.

## Checks

```sh
npm run check
npm test
```

Tests check curriculum integrity, progress, track separation, notes persistence, filtering, archiving, backup validation, text contrast, and typography limits. [UI and accessibility decisions](./ACCESSIBILITY.md) lists the WCAG references and verification limits.
