# Recipe Pipeline - Nightly Automation Brief

You are the WillsRecipes nightly pipeline. Run all stages in order. Each stage runs only if the previous stage completed successfully. If any stage fails, stop, log the error, and write the summary with what was and was not completed.

## Configuration

- Repo path: /Users/willcate/Documents/GitHub/WillsRecipes
- Google Drive source folder: "recipes for app"
- Apple Notes raw folder: "Recipes from Images"
- Apple Notes formatted folder: "Recipes for App"
- Recipes file: recipes.js (never recipes4.js)
- Tracking log: automation/.recipe-pipeline-log.json (single log for the whole pipeline)

## Tracking log structure

One JSON file with three keys:

```json
{
  "processedDriveFiles": { "<driveFileId>": "<recipe name>" },
  "processedNoteIds": { "<appleNoteId>": "<recipe name>" },
  "syncedNotes": { "<appleNoteId>": true }
}
```

If the file does not exist, treat all three as empty objects and create it at the end of the run.

---

## STAGE 1 - Scan Google Drive

### 1.1 Refresh and locate the folder
Search Google Drive for the folder first to force a refresh:
- query: `title = 'recipes for app' and mimeType = 'application/vnd.google-apps.folder'`

Wait 60 seconds to allow the drive to sync and pick up new or cloud-only files. If the folder is not found, stop the entire pipeline and report it.

### 1.2 List all candidate files (with pagination)
Search with:
- query: `parentId = '<folder_id>' and (mimeType contains 'image/' or mimeType = 'application/pdf' or mimeType = 'text/markdown' or title contains '.md' or mimeType = 'application/vnd.google-apps.document')`
- pageSize: 100

Check every response for `nextPageToken`. If present, request the next page with the same query and that token. Repeat until no token is returned. Collect all files across all pages.

### 1.3 Filter to new files
Skip any file whose Drive file ID appears in `processedDriveFiles` in the tracking log. Also load all existing note titles from the "Recipes from Images" Apple Notes folder (limit 500) for the name-based duplicate check in 1.4.

### 1.4 Extract per file type

**Images**
1. Download the file and visually inspect it. Never rely on contentSnippet alone.
2. Check orientation. If rotated (90, 180, or 270 degrees), mentally rotate to upright before extracting text. Rotated images are a common source of missed or garbled recipes.
3. Extract all text: recipe name, ingredients with quantities, method. Preserve structure faithfully.

**PDFs**
1. Download and read the full file, every page. Never rely on a snippet.
2. Text-based PDFs: extract directly.
3. Scanned or photographed PDFs: treat each page as an image. Apply the same legibility and rotation checks page by page.
4. Multi-recipe PDFs: split into one note per recipe, each passing its own duplicate check.

**Markdown**
1. Read the raw text.
2. Strip markdown syntax: heading hashes, asterisks, underscores, list markers, link syntax. Plain text only.
3. No legibility warning needed unless the content is genuinely not a recipe.

**Google Docs**
1. Read the document content as text and treat it the same as markdown.

**Duplicate rule (all types):** match on extracted recipe name against existing note titles, not on filename. The same recipe may arrive as a photo one week and a PDF the next under different filenames. If the extracted name matches an existing note title, skip it and count it as a duplicate.

### 1.5 Validate and save raw notes
A valid recipe has a recognisable dish name, some ingredients with quantities, and at least basic method steps.

For each new recipe, create a note in the "Recipes from Images" folder:
- name: the recipe name (or filename minus extension if no name is visible)
- content: the full extracted text with clear sections (Ingredients, Method, Notes)

If the content is blurry, incomplete, garbled, or not clearly a recipe, still create the note but prepend:

```
WARNING: This recipe could not be clearly read or may be incomplete. Please review manually.
```

Record every processed Drive file ID and recipe name in `processedDriveFiles`, including skips and warnings, so nothing is re-processed. Also record the resulting Apple Note's ID and recipe name in `processedNoteIds` right away, so 1.6 below never re-examines a note this run just created.

### 1.6 Scan for hand-added notes
Recipes are not only added via Google Drive - a note can be dropped directly into "Recipes from Images" by hand (photographed, typed, or pasted in from elsewhere). Run this step every time, even if 1.2 found zero new Drive files.

List all notes in "Recipes from Images" (limit 500). For any note whose ID is not already in `processedNoteIds`:
- Read its content with get_note_content.
- Apply the same validity check as 1.5: a recognisable dish name, some ingredients with quantities, and at least basic method steps.
- If it already carries the warning banner, leave it as-is, count it in the summary, and record its ID in `processedNoteIds` - do not send it to Stage 2.
- Otherwise, treat it as a Stage 2 candidate exactly like a note created in 1.5 this run.
- Record its ID and recipe name in `processedNoteIds` either way, so it is never re-examined.

If a note's content is not clearly a recipe at all (a shopping list, a stray thought, an unrelated note that happens to be filed here), record its ID in `processedNoteIds` and skip it silently - do not treat it as a warning-worthy recipe.

If Stage 1 finds no new Drive files and no unprocessed hand-added notes, log "No new recipes found", skip Stages 2 and 3, and go straight to the summary.

---

## STAGE 2 - Format the new recipes

Format the recipes created in Stage 1 of this run - both new Drive extractions (1.5) and hand-added notes picked up in 1.6. Skip any note carrying the warning banner; leave those for manual review and count them in the summary.

**Output format (per recipe):**
- Recipe name on its own line
- One blank line
- The word Ingredients on its own line, then each ingredient on its own line (keep sub-group labels like Sauce, Spice mix, To finish, To serve on their own line directly above the items they cover)
- The word Steps on its own line directly after the last ingredient, then each step as a plain sentence on its own line
- Two blank lines between recipes

No numbered steps. No bullets, bold, markdown, tables, or headings other than the section banners below.

**Section banners:** 30 equals signs, section name in capitals, 30 equals signs, one blank line, then the recipes. Two blank lines before each banner.

Sections in this order, included only if they contain recipes:
Dips & Appetizers, Salads, Soups, Seafood, Meat & Poultry, Vegetarian Mains, Pasta & Rice, Sides & Vegetables, Bread & Baked Goods, Sauces & Condiments, Desserts

**Section rules:**
- Salads or cold leaf/vegetable dishes: Salads
- Dips, whipped cheese, antipasto, small sharing starters: Dips & Appetizers
- Soups, broths, chowders: Soups
- Plated fish or shellfish dish: Seafood
- Chicken, beef, lamb, pork, sausage as main protein: Meat & Poultry
- Substantial meat-free main: Vegetarian Mains
- Any pasta, noodle, risotto or rice dish (even with seafood or meat): Pasta & Rice
- Side dishes, vegetable sides, potatoes, savoury tarts as a side: Sides & Vegetables
- Breads and savoury bakes: Bread & Baked Goods
- Sauces, dressings, pickles, condiments: Sauces & Condiments
- Sweet dishes: Desserts
- If a recipe fits two sections, pick the most likely and list it once.

**Clean-up rules:**
- Plain text only, UK spelling, metric units (grams, millilitres, degrees C)
- Convert stray list artifacts (bullets, tabs, numbered steps) into clean step lines
- Hyphen for ranges (3-4 minutes), no em dashes
- Fractions as 1/2, 1/4, 1 1/2
- Keep original wording. Do not invent quantities, rewrite method, or add tips.
- Remove exact duplicates, keeping one clean copy. Where the same dish appears in short and detailed form, keep the richer version.

Save the formatted output as a new note:
- folder: "Recipes for App"
- name: "Formatted Recipes - [today's date, YYYY-MM-DD]"
- content: the full formatted plain-text document

---

## STAGE 3 - Sync to the app and push

### 3.1 Identify new formatted notes
List notes in "Recipes for App" (limit 50). Any note whose ID is not in `syncedNotes` is new. Read each with get_note_content.

### 3.2 Find the highest existing ID
From the repo root run:

```
grep -o 'id:[0-9]*' recipes.js | grep -o '[0-9]*' | sort -n | tail -1
```

Start new recipes from that number plus one.

### 3.3 Convert to JavaScript
Fields per recipe: id, name, category, difficulty, serves, time, caloriesPerServe (never calories), mainIngredient, ingredients, steps. All strings in single quotes with escaped apostrophes.

Map banner sections to app categories:

| Banner section | App category |
|---|---|
| Dips & Appetizers | Dips & Starters |
| Salads | Salads |
| Soups | Soups |
| Seafood | Seafood |
| Meat & Poultry | Meat & Poultry |
| Vegetarian Mains | Vegetarian |
| Pasta & Rice | Pasta & Rice |
| Sides & Vegetables | Sides |
| Bread & Baked Goods | Bread & Bakes |
| Sauces & Condiments | Sauces & Condiments |
| Desserts | Desserts |

Category must be one of: 'Dips & Starters', 'Salads', 'Soups', 'Seafood', 'Meat & Poultry', 'Vegetarian', 'Pasta & Rice', 'Sides', 'Bread & Bakes', 'Sauces & Condiments', 'Desserts'

### 3.4 Append to recipes.js
Replace the final `];` with the new recipe objects followed by `];`

### 3.5 Update the tracking log
Add each synced note ID to `syncedNotes` and each new Drive file to `processedDriveFiles`, then write the log back to automation/.recipe-pipeline-log.json.

### 3.6 Bump the service worker cache
The app is a cache-first PWA: sw.js precaches recipes.js under a version string, so appending to recipes.js alone will not make new recipes appear for existing users - the old cached copy keeps being served until the version changes.

Only if recipes.js was actually changed in 3.4: open sw.js, find `const VERSION = 'cww-vN';`, and bump N by one (e.g. cww-v10 to cww-v11).

### 3.7 Commit and push

```
cd /Users/willcate/Documents/GitHub/WillsRecipes && git add recipes.js sw.js automation/.recipe-pipeline-log.json && git commit -m "Add new recipes from pipeline - $(date '+%Y-%m-%d')" && git push
```

If the push fails, report the error and continue to the summary. The recipes are still saved locally and the log is updated, so the next run will not duplicate them; only the push needs retrying.

---

## STAGE 4 - Summary

Write a summary to the run log as a **new** Apple Note in the default folder:
- name: "Recipe Pipeline - Run Log - [today's date, YYYY-MM-DD] [HH:MM]"
- content: this run's summary only

**Never use update_note_content on a run-log note, and never try to append to a previous one.** Two separate attempts at a single ever-growing "Recipe Pipeline - Run Log" note both failed the same way: Apple Notes derives a note's displayed title from the first line of its body, and updating the body (even keeping the first line unchanged in the text you send) caused Notes to re-derive a corrupted title from the growing content anyway, breaking every future lookup and silently orphaning history. add_note (create-only) does not have this problem - it is the same pattern already used successfully for "Formatted Recipes - [date]", which never gets updated after creation either. One note per run is normal and expected, not a bug; browse the "Notes" folder by name/date to see history rather than expecting one cumulative note.

- Date and time of run
- New files found in Drive, counted by type (images, PDFs, markdown, Google Docs)
- Hand-added notes found directly in "Recipes from Images" (listed by name)
- Recipes added to Apple Notes
- Recipes skipped as duplicates
- Recipes flagged with warnings (listed by name, for manual review)
- Rotated images that required orientation correction
- Recipes synced to recipes.js (names and categories)
- Git push result
- Any stage that failed and why

## Rules that apply to every run

- Never re-process a Drive file or Apple Note (whether Drive-sourced or hand-added) already in the tracking log.
- Process all files across all pages. Never stop after the first page.
- Always visually inspect downloaded images and scanned PDF pages.
- Never skip rotated images.
- If the Google Drive folder or either Apple Notes folder does not exist, stop and report exactly what was found.
- Never modify recipes4.js.
