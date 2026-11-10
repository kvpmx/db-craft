# Maintaining the tutorial

The public tutorial lives at `/tutorial` and uses Nuxt Content v3. Articles are version-controlled
Markdown in `content/tutorial/`, registered as the `tutorial` page collection in
`content.config.ts`. Nuxt Content parses YAML frontmatter and Markdown, generates heading anchors
and the table of contents, and provides collection queries and search sections. The page uses those
queries for navigation, full-text search, and reading times, and renders articles with
`ContentRenderer`.

Nuxt Content uses its own generated SQLite database through `better-sqlite3`; no Supabase migration
or CMS account is needed. Generated content data stays in the ignored `.data/` directory.
Rebuild/redeploy the app to publish edits; content reloads during development. Content is pinned to
3.6.3 for compatibility with this app's Nuxt version; check compatibility before upgrading it.

## Add or edit an article

Use a numbered filename such as `15.new-feature.md`. The number and dot follow Nuxt Content ordering
conventions; the rest becomes the stable URL `/tutorial/new-feature`. Keep existing slugs stable for
inbound links.

```markdown
---
title: A clear article title
section: Design your schema
icon: lucide:table-2
---

A short plain-text introduction used in the overview and search results.

## First task

1. Open **Tables**.
2. Select **New table**.

> Explain a prerequisite or important limitation here.

[Related guide](/tutorial/relationships)
```

Supported sections are `First steps`, `Design your schema`, `Work together`, and `Reference`. Add or
reorder sections in `lib/tutorial/constants.ts` and their labels in `lib/tutorial/messages.ts`. The
collection schema defines `section` and `icon`; use normal YAML frontmatter for metadata. Put the
title in frontmatter so the page renders exactly one H1. Nuxt Content derives the description from
the first paragraph, or you can supply an explicit `description` in frontmatter.

Use H2/H3 for the generated outline. Nuxt Content generates heading anchors, so copy the rendered
anchor when linking to a section. Standard links, lists, blockquotes, fenced code, bold/italic text,
and GFM tables are supported. Keep instructions tied to the actual UI labels.

## Language

The tutorial is English-only, whatever the app's interface language. Section names and page controls
live in `lib/tutorial/messages.ts`.

## Screenshots and recordings

Put assets in `public/tutorial/media/`, using lowercase hyphenated filenames. Use the Nuxt Content
MDC `tutorial-media` component for captioned screenshots and videos:

```mdc
::tutorial-media{src='/tutorial/media/table-fields.png' alt='Explain exactly what the screenshot shows'}
::
```

The Vue component in `features/tutorial/media.vue` provides alt text, captions, lazy loading, and a
full-size link for screenshots. Supported image extensions are PNG, WebP, JPG, and SVG. The
component accepts media only from the local tutorial folder. Markdown/MDC files are trusted,
reviewed source code and can render Vue components; do not load untrusted user content into this
collection.

For a video, use the same component with a WebM or MP4 source:

```mdc
::tutorial-media{src='/tutorial/media/fields-walkthrough.webm' alt='Add a field and choose its type'}
::

**Text walkthrough:** describe every action shown, so the guide works without playing the video.
```

For each `example.webm`, add `example.png` as its poster and `example.vtt` as English WebVTT
captions. Native controls allow pause, seek, volume, captions, and fullscreen; videos never
autoplay, and their data is not preloaded. Always provide a written walkthrough, meaningful
captions, and a poster. Keep recordings short and use sample data. `features/tutorial/table.vue`
keeps Markdown tables scrollable and keyboard accessible through `ContentRenderer`'s component
mapping.

The committed screenshots and recordings use the actual app components with fictional shop schema
data in the English interface. `scripts/tutorial-capture.vue` is the reusable capture fixture. To
refresh media:

1. Temporarily copy it to `pages/tutorial/capture.vue` and start the dev server.
2. Open `/tutorial/capture`. Use `?mode=new-project` or `?mode=settings` for those views. The editor
   is backed by sample state; history and AI results are stubbed. Do not use a signed-in production
   session or send requests while recording. The sample AI proposal is an illustrative response, not
   a claim about deterministic model output.
3. Use the real controls to capture screenshots and browser recordings at 1440 × 900. Hide the
   development tools overlay. Add English caption tracks and written walkthroughs.
4. Remove `pages/tutorial/capture.vue` before building or committing. It is deliberately kept
   outside the pages directory in source so sample state and stubs never ship as an app route.

## Coverage checklist when features change

| Area                                          | Articles                                 | Implementation to review                                                                      |
| --------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Registration, login, profile, sign-out        | Getting started; Account and preferences | `pages/login.vue`, `pages/register.vue`, `features/common/user-button.vue`                    |
| Workspace, cards, creation, visibility        | Projects and visibility                  | `features/home/`, `pages/index.vue`, `pages/teams/[id]/index.vue`                             |
| Header, sidebar, view controls, stacking      | Editor and canvas                        | `features/diagram/page-header.vue`, `sidebar.vue`, `canvas.vue`                               |
| Tables, field editing, types, constraints     | Tables and fields                        | `tables-panel.vue`, `table-section.vue`, `table-field-options.vue`, `field-type-selector.vue` |
| Endpoints, naming, cardinality, search        | Relationships                            | `relations-panel.vue`, `relation-form-dialog.vue`, `relation-edge.vue`                        |
| Notes and groups                              | Notes and groups                         | `note-node.vue`, `group-node.vue`                                                             |
| Chat, suggestions, proposals, persistence     | AI assistant                             | `features/diagram/ai-*.vue`, `composables/diagram-ai-chat.ts`                                 |
| Save, undo/redo, version snapshots, restore   | Saving and version history               | `stores/current-project.ts`, `save-button.vue`, `version-history-sheet.vue`                   |
| Teams, invites, roles, deletion               | Teams and permissions                    | `pages/teams/`, team controllers and database policies                                        |
| Presence, shared edits, status, recovery      | Live collaboration                       | `lib/collaboration/`, `collaborators.vue`, `collaboration-cursors.vue`                        |
| Public link and read-only access              | Sharing diagrams                         | `share-dialog.vue`, `pages/diagram/share/[uuid].vue`                                          |
| Dialects, dimensions, FK actions, limitations | SQL export and database types            | `sql-code-dialog.vue`, `lib/sql-generator/`, `lib/constants/diagram.ts`                       |
| Languages and cardinality preference          | Account and preferences                  | `pages/settings.vue`, `features/settings/`                                                    |
| Keyboard controls and errors                  | Shortcuts and troubleshooting            | Canvas handlers, access middleware, UI validation                                             |

Describe implemented behavior, including constraints. Do not copy aspirational README features into
the guide without verifying their controls. Refresh corresponding screenshots when the UI changes.
Each new user-facing feature needs steps, permission/prerequisite details, save/recovery behavior,
and an entry in the relevant article or a new article.

## Validate

Run `yarn typecheck`, `yarn lint`, and `yarn build` for application checks. Check `/tutorial` and a
direct article URL while signed out, search by a term only found in article body text, follow
outline and previous/next links, verify unknown slugs return 404, and test mobile navigation and
video playback. Verify the tutorial stays in English for every interface language.
