# JLPT Lern-App — Implementation Plan

> **Status:** Final specification for implementation  
> **Last updated:** 2026-07-11 (React + Vite conventions added)  
> **Purpose:** Single source of truth for all implementation decisions  
> **Audience:** Developer (private, single-user app)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [Architectural Decisions (ADR)](#3-architectural-decisions-adr)
4. [Core Principles](#4-core-principles)
5. [Study Plan (Reference until December 2026)](#5-study-plan-reference-until-december-2026)
6. [Feature Scope](#6-feature-scope)
7. [Information Architecture (Screens)](#7-information-architecture-screens)
8. [Data Model](#8-data-model)
9. [Supabase Backend](#9-supabase-backend)
10. [Local Storage (Dexie.js / IndexedDB)](#10-local-storage-dexiejs--indexeddb)
11. [Synchronisation](#11-synchronisation)
12. [Bulk Import](#12-bulk-import)
13. [Global Search](#13-global-search)
14. [Learning Logic](#14-learning-logic)
15. [Audio (Listening)](#15-audio-listening)
16. [Technology Stack](#16-technology-stack)
17. [Implementation Order (MVP)](#17-implementation-order-mvp)
18. [Costs & Limits](#18-costs--limits)
19. [Backup Strategy](#19-backup-strategy)
20. [Legal & Content Policy](#20-legal--content-policy)
21. [Open Questions / Future Considerations](#21-open-questions--future-considerations)
22. [React + Vite Architecture & Best Practices](#22-react--vite-architecture--best-practices)

---

## 1. Project Overview

| Aspect | Decision |
|--------|----------|
| **Purpose** | Prepare for JLPT N4 exam (early December 2026); recap N5 gaps; track progress and identify weak topics |
| **User** | Single user only (the owner) — no multi-user, no App Store, no public distribution |
| **Platform** | **PWA** — usable on Web (desktop/tablet) and Android (installable) |
| **Skills tracked** | Reading, Listening, Kanji, Vocabulary, Grammar |
| **Levels** | N4 (primary focus), N5 (recap) |
| **Content** | No pre-installed textbook content; user imports own lists + optional JLPT base lists |
| **Sources** | Metadata only (Genki, Anki, videos, textbooks, etc.) — **NOT** the organizing principle |
| **Backend / Sync** | **Supabase** — Postgres (data) + Storage (audio) + Auth |
| **Local storage** | **Dexie.js** over IndexedDB (offline-first cache) |
| **Device usage** | Regular switching between Web and Android — automatic sync required |
| **Region** | Supabase **EU** (e.g. Frankfurt) |
| **Excluded services** | No Google (Drive, Firebase, Google Login) |

---

## 2. Goals & Success Criteria

### Primary goals
- Track JLPT N4 preparation across all 5 skill areas
- Identify which topics still need attention
- Support N5 recap for foundational gaps
- Work offline; sync seamlessly when online
- Allow bulk addition of custom learning items from any source
- Search existing items before adding duplicates

### Success criteria (acceptance)
- [ ] Study on phone → open laptop → **identical progress** after sync
- [ ] Upload listening audio → playable on both devices
- [ ] Global search (kanji / vocab / grammar / topics) returns results in < 1 second locally
- [ ] Bulk import of 50 items in < 2 minutes
- [ ] Dashboard clearly shows **N4 weak topics** per skill
- [ ] N5 recap targets **actual gaps only**, not full N5 re-learn
- [ ] Full offline learning works; sync runs automatically when online
- [ ] No Google dependency
- [ ] Only the owner has data access (Supabase RLS)
- [ ] Sources are optional metadata; JLPT structure remains primary

---

## 3. Architectural Decisions (ADR)

### ADR-001: PWA (not native Android app)
**Decision:** Build a Progressive Web App.  
**Rationale:** Single codebase for Web + Android; installable on Android; faster iteration; sufficient for private single-user use.  
**Alternatives considered:** Native Android (rejected: two codebases), Flutter (viable but more setup).

### ADR-002: Supabase (not Nextcloud/WebDAV)
**Decision:** Use Supabase for sync and storage.  
**Rationale:** Official JS client works in PWA on Web and Android; Postgres handles structured data with row-level sync; **Storage is built for audio files**; simpler than WebDAV + single JSON merge.  
**Alternatives considered:** Nextcloud/WebDAV (rejected as primary: more complex merge logic, less natural for audio blobs).

### ADR-003: Dexie.js for local IndexedDB
**Decision:** Use Dexie.js as IndexedDB wrapper.  
**Rationale:** Clean API for structured relational-ish data; indexes for search and SRS; schema migrations; TypeScript support; works offline in PWA.  
**Alternatives considered:** Raw IndexedDB (too verbose), idb (lighter but more DIY), localForage (too simple), RxDB (overkill).

### ADR-004: Offline-first with delta sync
**Decision:** IndexedDB is local source of truth while offline; delta sync to Supabase when online.  
**Rationale:** User learns without network; regular device switching requires reliable merge.

### ADR-005: Source-neutral content model
**Decision:** Organize by JLPT level + skill + topic; sources are optional metadata.  
**Rationale:** User uses multiple resources (not only Genki); Genki must not be central navigation.

### ADR-006: Private use only
**Decision:** No multi-user, no public deployment requirement.  
**Rationale:** Simplifies auth (one account), RLS, and content licensing (user imports own data).

### ADR-007: No Google services
**Decision:** Do not use Google Drive, Firebase, or Google Login.  
**Rationale:** Explicit user requirement.

### ADR-008: Proton Drive not used for sync
**Decision:** Do not use Proton Drive as primary sync backend.  
**Rationale:** No native WebDAV; no PWA-friendly official API for third-party apps (SDK not GA for production); community WebDAV bridges don't work on Android PWA.  
**Optional:** Manual JSON backup to Proton Drive folder as secondary backup only.

### ADR-009: Single item, single progress
**Decision:** One LearningItem per word/kanji/grammar pattern; multiple sources attach via ItemSource.  
**Rationale:** Avoid duplicate progress when same item appears in multiple textbooks/decks.

### ADR-010: EU Supabase region
**Decision:** Host Supabase project in EU (Frankfurt).  
**Rationale:** Data residency preference for private learning data.

### ADR-011: React + Vite (not SvelteKit)
**Decision:** Use **React 19 + Vite** as the frontend framework and build tool.  
**Rationale:** Explicit user choice; large ecosystem; excellent PWA support via `vite-plugin-pwa`; TypeScript-first; familiar component model.  
**Constraints:** Modular architecture — no monolithic components or files (see [§22](#22-react--vite-architecture--best-practices)).  
**Alternatives considered:** SvelteKit (rejected: user preference for React).

---

## 4. Core Principles

1. **JLPT and skill drive the UI** — dashboard, study plan, weakness analysis
2. **Source-neutral** — any learning material as optional metadata
3. **One item, one progress** — duplicate sources attach, don't duplicate items
4. **Offline-first** — learn without network; sync when online
5. **Bulk import is primary content entry** — not manual one-by-one entry
6. **Topic mastery matters** — track mastery per topic, not just hours studied
7. **Global search** — find kanji, vocabulary, grammar, topics before adding duplicates
8. **Supabase for remote** — Postgres for structured data, Storage for audio

---

## 5. Study Plan (Reference until December 2026)

> The app supports this rhythm; the **in-app plan follows JLPT weaknesses**, not textbook chapter order.

| Phase | Approx. weeks | Focus |
|-------|---------------|-------|
| **1** | 1–6 | N5 diagnostic; mark gaps; start N4 foundations |
| **2** | 7–14 | N4 bulk; integrate reading/listening |
| **3** | 15–20 | Mock tests (v2); focus on weakest topics |
| **4** | Last 2–3 | Review only; no new material |

### Daily rhythm (guideline)
- SRS (due cards)
- 1–2 weak topics
- Short listening practice

### N5 recap ratio
- Default: **20%** of study time for N5 recap
- Configurable in settings (`n5RecapRatio`)
- Only items/topics flagged as gaps — not full N5 re-learn

### Weekly rhythm
- 5 study days × 45–60 min (configurable via `dailyGoalMinutes`)
- Sunday: week review via dashboard

---

## 6. Feature Scope

### Version 1 — MVP

#### Content & Learning
- [ ] Five skills: Vocabulary, Kanji, Grammar, Reading, Listening
- [ ] Levels: N5, N4
- [ ] Topics (optionally hierarchical)
- [ ] Learning Items: word, kanji, grammar (reading/listening simplified in v1)
- [ ] SRS (SM-2 or FSRS) for vocabulary, kanji, grammar
- [ ] Manual single-item create/edit
- [ ] Bulk import — CSV/TSV, paste text, column mapping
- [ ] Source metadata — multiple sources per item
- [ ] Duplicate handling — skip / attach source / update
- [ ] Import preview with validation and error list

#### Search
- [ ] Global search across vocabulary, kanji, grammar, topics, tags, sources
- [ ] Filters: type, level, skill, mastery status
- [ ] Grouped results (Topics / Grammar / Vocabulary / Kanji)
- [ ] Duplicate hint on manual create
- [ ] Duplicate display in bulk import ("already exists")
- [ ] Offline-capable (local IndexedDB)

#### Progress & Planning
- [ ] Dashboard — days until exam, readiness per skill, top weak topics
- [ ] Topic status — new / learning / familiar / mastered
- [ ] "Study today" — SRS queue + recommended weak topics
- [ ] Exam date in settings (default: early December 2026)
- [ ] Simple weekly plan from weaknesses + remaining time
- [ ] Study session log (duration, skill, reviews, optional note)

#### Sync, Backend & Backup
- [ ] Supabase Postgres — central data store
- [ ] Supabase Storage — bucket for listening audio
- [ ] Supabase Auth — single private account (email + password)
- [ ] Row Level Security — own data only
- [ ] Dexie.js / IndexedDB — local cache + offline operation
- [ ] Delta sync — push/pull changed records since `lastSyncAt`
- [ ] Sync on app start and after study sessions
- [ ] Sync status UI — last synced, pending changes, offline indicator
- [ ] JSON export/import — local backup (additional)
- [ ] Audio: upload to Storage, playback via signed URL; optional local cache (v2)

#### UI
- [ ] Dashboard
- [ ] Study today / review session
- [ ] Browse by skill / level / topic (+ source filter)
- [ ] Global search
- [ ] Add — single + bulk import (+ CSV templates)
- [ ] Settings (exam date, sync, login)
- [ ] Theme: light / dark / system

### Version 2 — Extensions
- [ ] Reading/listening — passages, audio upload, questions
- [ ] Mock tests — timed sections, wrong answers → topics
- [ ] Anki import (.apkg or CSV export)
- [ ] Undo import (per ImportBatch)
- [ ] Statistics — history, streak, heatmap
- [ ] N5 diagnostic quiz on first launch
- [ ] Statistics by source (informational only)
- [ ] Audio offline cache (Service Worker)
- [ ] Realtime sync (optional, Supabase Realtime)

### Explicitly out of scope
- Multi-user, public app, App Store distribution
- Google services
- Pre-installed textbook content (Genki etc.)
- Genki as central navigation
- Supabase self-hosted (optional later)
- Proton Drive as primary sync
- Realtime sync as requirement for v1

---

## 7. Information Architecture (Screens)

```
┌──────────────────────────────────────────────────────────────┐
│  🔍 Global Search (header)              Sync status           │
├──────────────────────────────────────────────────────────────┤
│  Dashboard                                                    │
│  · Days until N4                                              │
│  · Readiness: Vocab | Kanji | Grammar | Reading | Listening   │
│  · Top 5 weak topics                                          │
│  · [ Start study today ]                                      │
├──────────────────────────────────────────────────────────────┤
│  Learn                                                        │
│    ├─ Vocabulary / Kanji / Grammar / Reading / Listening      │
│    └─ Filters: level, topic, tag, source, status              │
├──────────────────────────────────────────────────────────────┤
│  Topics & N5 Recap                                            │
│    └─ Topic list with mastery %, needsAttention flag          │
├──────────────────────────────────────────────────────────────┤
│  Add                                                          │
│    ├─ Single item                                             │
│    └─ Bulk import                                             │
├──────────────────────────────────────────────────────────────┤
│  Settings                                                     │
│    ├─ Exam date, daily goal, N5 recap ratio                   │
│    ├─ Supabase login / sync                                   │
│    └─ Export / import backup (JSON)                           │
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Data Model

### 8.1 Entity overview

```
Topic           → JLPT topics
Source          → Learning source (label, type)
LearningItem    → Word, kanji, grammar, passage, …
ItemSource      → n:m link Item ↔ Source
Review          → Single SRS review event
UserProgress    → SRS state per item
TopicProgress   → Aggregated per topic (computed/cached)
StudySession    → Session log
ImportBatch     → Bulk import history
MockResult      → Mock test result (v2)
AppSettings     → Exam date, UI, sync metadata
SyncMeta        → Local only in IndexedDB
```

All Supabase tables include: `user_id`, `created_at`, `updated_at`, optional `deleted_at` (soft delete).

### 8.2 Topic

```typescript
Topic {
  id: string                      // UUID
  userId: string
  level: "N5" | "N4"
  skill: "vocabulary" | "kanji" | "grammar" | "reading" | "listening"
  name: string                    // e.g. "Te-Form", "Transport", "Past tense"
  parentTopicId?: string
  description?: string
  sortOrder?: number
  createdAt: string               // ISO 8601
  updatedAt: string
  deletedAt?: string
}
```

### 8.3 Source (source-neutral)

```typescript
Source {
  id: string
  userId: string
  label: string                   // "Genki II", "Try! N4", "Anki", "YouTube", "Own"
  type?: "book" | "deck" | "video" | "podcast" | "list" | "other"
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### 8.4 LearningItem

```typescript
LearningItem {
  id: string
  userId: string
  type: "word" | "kanji" | "grammar" | "reading" | "listening"
  level: "N5" | "N4"
  skill: "vocabulary" | "kanji" | "grammar" | "reading" | "listening"

  japanese: string                // word, kanji, grammar pattern, or passage title
  reading?: string
  meaning: string
  meaningAlt?: string
  example?: string
  exampleReading?: string
  notes?: string

  // Kanji-specific
  onyomi?: string
  kunyomi?: string

  // Reading/listening
  passageText?: string
  audioStoragePath?: string       // Supabase Storage: "{userId}/{itemId}/audio.mp3"
  audioUrl?: string               // external URL OR runtime signed URL
  audioMimeType?: string
  questions?: Question[]          // { id, prompt, options[], correctIndex }

  topicIds: string[]              // or separate item_topics junction table
  tags: string[]

  isCustom: boolean
  importBatchId?: string

  createdAt: string
  updatedAt: string
  deletedAt?: string
}
```

### 8.5 ItemSource

```typescript
ItemSource {
  id: string
  userId: string
  itemId: string
  sourceId: string
  reference?: string              // "L15", "Unit 3", "Episode 12"
  notes?: string
  createdAt: string
}
```

### 8.6 Review & UserProgress

```typescript
Review {
  id: string
  userId: string
  itemId: string
  grade: 0 | 1 | 2 | 3 | 4 | 5
  responseTimeMs?: number
  reviewedAt: string
  deviceId?: string
}

UserProgress {
  id: string
  userId: string
  itemId: string
  interval: number                // days
  easeFactor: number
  repetitions: number
  nextReviewAt: string
  lastReviewAt?: string
  masteryLevel: "new" | "learning" | "familiar" | "mastered"
  accuracyRecent?: number         // 0–100, last N reviews
  updatedAt: string
}
```

### 8.7 TopicProgress (computed or cached)

```typescript
TopicProgress {
  topicId: string
  itemCount: number
  masteredCount: number
  masteryPercent: number          // 0–100
  needsAttention: boolean
  lastStudiedAt?: string
  updatedAt: string
}
```

**Rules — `needsAttention`:**
- Accuracy of last 3 reviews < 70%, OR
- Items in topic are overdue for review, OR
- N5 topic < 60% and relevant for N4

**Rules — `mastered`:**
- ≥ 90% accuracy over last 3 reviews AND interval ≥ 14 days

### 8.8 StudySession, ImportBatch, AppSettings

```typescript
StudySession {
  id: string
  userId: string
  startedAt: string
  endedAt?: string
  durationMinutes?: number
  skills: string[]
  topicIds?: string[]
  itemsReviewed: number
  accuracy?: number
  notes?: string
}

ImportBatch {
  id: string
  userId: string
  filename?: string
  importedAt: string
  itemCount: number
  skippedCount: number
  errorCount: number
  errors?: { row: number; message: string }[]
}

AppSettings {
  id: string
  userId: string
  examDate: string                // "2026-12-06"
  dailyGoalMinutes: number        // e.g. 45
  n5RecapRatio: number            // 0.2 = 20%
  locale: "de"
  theme: "light" | "dark" | "system"
  updatedAt: string
}
```

### 8.9 SyncMeta (local IndexedDB only)

```typescript
SyncMeta {
  deviceId: string
  lastSyncAt?: string
  lastSyncStatus: "ok" | "error" | "offline" | "pending"
  pendingChangeCount: number
  schemaVersion: number
}
```

---

## 9. Supabase Backend

### 9.1 Architecture

```
PWA (Web + Android)
  ├─ UI / Screens
  ├─ Dexie.js (IndexedDB) — local cache
  └─ Offline pending queue
         ↕ delta sync (online)
Supabase (EU region)
  ├─ Auth — single account
  ├─ Postgres — topics, items, reviews, progress, …
  └─ Storage — listening-audio bucket
```

### 9.2 Postgres tables

```sql
-- All tables: user_id REFERENCES auth.users(id)
-- RLS: user_id = auth.uid()

topics
sources
learning_items
item_sources
item_topics          -- optional junction: item_id ↔ topic_id
reviews
user_progress
study_sessions
import_batches
app_settings
```

### 9.3 Indexes (performance)

```sql
learning_items(user_id, japanese, type)
learning_items(user_id, level, skill)
reviews(user_id, item_id, reviewed_at)
user_progress(user_id, next_review_at)
-- All tables: (user_id, updated_at) for delta sync
```

### 9.4 Row Level Security

Every table and storage bucket: **only `auth.uid()` matches `user_id`**.

Example:
```sql
CREATE POLICY "Users can only access own items"
  ON learning_items FOR ALL
  USING (user_id = auth.uid());
```

### 9.5 Auth

- Email + password (single private account)
- Session persisted in browser/PWA
- Same session across Web and Android after login

---

## 10. Local Storage (Dexie.js / IndexedDB)

### Role
- Offline learning without network
- Fast local search
- SRS queue computation
- Pending sync queue while offline
- Local cache of all synced Supabase data

### Dexie schema (mirrors Postgres)

```typescript
// Example Dexie version 1 stores definition
db.version(1).stores({
  topics:             'id, userId, level, skill, name, updatedAt',
  sources:            'id, userId, label, updatedAt',
  learningItems:      'id, userId, type, level, skill, japanese, reading, updatedAt, *tags',
  itemSources:        'id, userId, itemId, sourceId',
  reviews:            'id, userId, itemId, reviewedAt',
  userProgress:       'id, userId, itemId, nextReviewAt, updatedAt',
  studySessions:      'id, userId, startedAt',
  importBatches:      'id, userId, importedAt',
  appSettings:        'id, userId',
  syncMeta:           'id',
  pendingChanges:     '++id, table, recordId, createdAt',
});
```

### Why Dexie (summary)
- IndexedDB native API is verbose
- Structured data with indexes for search and SRS
- Schema migrations as app evolves
- TypeScript support
- Works in PWA on Web and Android

---

## 11. Synchronisation

### 11.1 Principle: offline-first + delta sync

```
1. App start (online):
   a) Pull all rows where updated_at > lastSyncAt
   b) Merge into IndexedDB
   c) Push pending queue → Supabase
   d) Update lastSyncAt

2. After study session:
   → Push reviews + userProgress immediately

3. Offline:
   → Write locally + add to pendingChanges queue
   → UI: "X changes waiting for sync"
```

### 11.2 Merge rules

| Entity | Rule |
|--------|------|
| Topic, Source, LearningItem, ItemSource, UserProgress, AppSettings | Same `id` → newer `updatedAt` wins; respect `deletedAt` |
| Review | Append-only; dedupe by `id` |
| StudySession, ImportBatch | Union; dedupe by `id` |

Conflicts are rare (single user). Fallback: newer `updatedAt` wins.

### 11.3 When to sync
- **Required:** app start, after study session
- **Optional:** every 5–15 min when online, manual "Sync now" button
- **On bulk import:** push after import completes

### 11.4 Sync status UI
- Last synced timestamp
- Pending change count
- Offline indicator
- Error state with retry

### 11.5 Rejected alternatives (documented)

| Alternative | Why not primary |
|-------------|-----------------|
| Nextcloud/WebDAV + single JSON | Works but awkward for audio; manual merge logic; no official PWA client |
| Proton Drive | No WebDAV; no production third-party API; bridges don't work on Android PWA |
| Google Drive/Firebase | Explicitly excluded |
| Supabase Realtime | Optional v2; not required for v1 |

---

## 12. Bulk Import

### 12.1 CSV minimum

```csv
type,level,skill,japanese,meaning
word,N4,vocabulary,電車,Zug
kanji,N4,kanji,運,transportieren
grammar,N4,grammar,てから,nachdem
```

### 12.2 CSV recommended (full)

```csv
type,level,skill,topics,reading,german,example,source,source_ref,tags,notes
word,N4,vocabulary,"transport,verbs",電車,でんしゃ,Zug,電車に乗ります,Try! N4,Unit 3,n4-core,
grammar,N4,grammar,te-form,なければならない,,müssen,宿題をしなければならない,Eigen,,,
```

Column notes:
- `topics` — comma-separated; create if missing (configurable)
- `source` / `source_ref` — optional; create Source if missing
- `german` — use if `meaning` is EN; otherwise `meaning` = DE

### 12.3 Import flow

1. Upload file or paste text
2. Map columns (if headers differ)
3. Preview — valid/invalid rows, **duplicates marked**
4. Options — duplicates: attach source / skip / update; create new topics/sources
5. Save locally → push to Supabase
6. Result screen — success, warnings, link to affected topics

### 12.4 Duplicate detection

- Primary key: `type` + normalized `japanese`
- Default action: **attach source** (do not create duplicate item)

### 12.5 Defaults for missing fields

- Missing `level` → N4
- Missing `skill` → derive from `type`
- Missing `topic` → "Import [date]" or "Unsorted"

### 12.6 CSV templates to ship

- `vocabulary-template.csv`
- `kanji-template.csv`
- `grammar-template.csv`

---

## 13. Global Search

### 13.1 Searchable fields

| Type | Fields |
|------|--------|
| Vocabulary | japanese, reading, meaning |
| Kanji | japanese, onyomi, kunyomi, meaning |
| Grammar | japanese (pattern), meaning, example, notes |
| Topics | name, description |
| Meta | tags, Source.label, Source.reference |

### 13.2 Behavior

- Live search (debounced ~200ms)
- Partial match (`食` → 食べる, 食事, …)
- Normalize hiragana/katakana, full/half-width
- Filters: type, level, skill, mastery, "weak only"
- Grouped results with type badge and mastery %
- Click → item detail / topic overview / "Review now"
- On create: "Similar entry already exists" warning
- **Primary search target: local IndexedDB** (fast, offline)
- Reindex after sync

### 13.3 Example UI

```
[ 🔍 te-form_______________ ]  Type: All ▼  Level: N4 ▼

Topics (1)
  Te-Form — Grammar N4 — 58% — ⚠ needs attention

Grammar (4)
  てから — after doing — 75%
  てください — please … — 40% ⚠

Vocabulary (2)
  手伝う — to help

Kanji (0)

[ + Create new item ]
```

### 13.4 Technology

- Dexie indexes on `japanese`, `reading`, `meaning`, `type`, `level`
- Optional Fuse.js for fuzzy search
- Fully offline

---

## 14. Learning Logic

### 14.1 Daily session ("Study today")

1. **SRS due** — all overdues + daily limit (~30 cards)
2. **Weakness boost** — 5–10 items from top 3 topics with `needsAttention`
3. **N5 recap** — proportional to `n5RecapRatio` (default 20%)

### 14.2 Weekly plan (v1, simple)

- Input: `examDate`, `dailyGoalMinutes`, TopicProgress
- Output per weekday: SRS minutes + 1–2 focus topics + skill rotation
- Sunday: week review via dashboard

### 14.3 Readiness score (dashboard)

Optional weighted average:
- Vocabulary 25%, Kanji 20%, Grammar 25%, Reading 15%, Listening 15%
- Penalty if any skill < 60%

### 14.4 Session logging

Track per session:
```
Date | Duration | Skill | Topics | Items reviewed | Accuracy | Notes
```

Aggregate: item → topic → skill → level → overall readiness

---

## 15. Audio (Listening)

### 15.1 Supabase Storage bucket

```
Name:     listening-audio
Access:   private (no public access)
RLS:      only user_id = auth.uid()
```

### 15.2 Path convention

```
{user_id}/{item_id}/audio.mp3
{user_id}/{item_id}/audio.ogg
```

### 15.3 Upload & playback flow

1. User selects audio file on listening item
2. App uploads to Storage
3. Save `audioStoragePath` in `learning_items`
4. Playback via **signed URL** (short expiry, e.g. 1 hour)
5. v2: cache in IndexedDB / Cache API for offline playback

### 15.4 External audio

If not uploaded:
- `audioUrl` = external URL (YouTube, podcast, etc.)
- `audioStoragePath` = null

### 15.5 Size estimates (private use)

| Content | Approx. size |
|---------|--------------|
| 1 min MP3 (128 kbps) | ~1 MB |
| 100 exercises × 2 min | ~200 MB |

Use OGG or lower bitrate to save space if needed.

---

## 16. Technology Stack

| Layer | Choice |
|-------|--------|
| Framework | **React 19 + Vite** |
| Routing | **React Router** |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Local storage | **Dexie.js** (IndexedDB) |
| Backend | **Supabase** (Postgres + Auth + Storage) |
| Client | `@supabase/supabase-js` |
| Server state / async | TanStack Query (optional, for Supabase fetches) |
| Forms | React Hook Form + Zod (optional) |
| SRS | fsrs.js or SM-2 |
| PWA | vite-plugin-pwa |
| Search | Local Dexie filter + optional Fuse.js |
| Audio playback | HTML5 `<audio>` + Supabase signed URLs |

> **Architecture conventions:** See [§22 React + Vite Architecture & Best Practices](#22-react--vite-architecture--best-practices).

### Deployment (private)
- Static PWA build (Vercel, Netlify, own server, or Supabase hosting)
- Supabase project in **EU region**
- RLS enabled on all tables and storage buckets
- For personal use only

---

## 17. Implementation Order (MVP)

1. Project scaffold (PWA + TypeScript + Tailwind)
2. Supabase project (EU) — tables, RLS, storage bucket
3. Auth — login screen, session persistence
4. Dexie schema (mirrors Postgres + pendingChanges)
5. CRUD — topics, items, sources, itemSources
6. Delta sync — pull/push + offline queue
7. SRS engine + review session UI
8. TopicProgress computation
9. Dashboard + "Study today"
10. Global search
11. Bulk import CSV
12. Audio upload + playback (Storage)
13. JSON export/import (backup)
14. Settings + sync status UI
15. Polish — CSV templates, dark mode, error handling

---

## 18. Costs & Limits

| Supabase plan | Postgres | Storage | Recommendation |
|---------------|----------|---------|----------------|
| **Free** | ~500 MB | ~1 GB | Start, MVP, few audio files |
| **Pro (~$25/mo)** | 8 GB | 100 GB | More listening material, long-term |

Monitor audio storage volume as listening content grows.

---

## 19. Backup Strategy

| Method | When |
|--------|------|
| **Supabase sync** | Continuous, automatic |
| **JSON export** | Optional weekly, stored locally |
| **Proton Drive / other** | Optional manual archive of JSON export (not primary sync) |
| **Supabase dashboard backup** | Optional (Pro feature / manual) |

Supabase is primary; JSON export is additional safety net.

---

## 20. Legal & Content Policy

- App is **private** — no distribution to others
- **No pre-installed** copyrighted textbook content (Genki, etc.)
- User imports **own notes, lists, and exports** from materials they personally use
- Audio files: only material user created or has legal right to use
- Sources stored as metadata only
- Genki and other textbooks are **optional source labels**, not built-in content

---

## 21. Open Questions / Future Considerations

- [x] Final framework choice: **React + Vite** (see ADR-011, §22)
- [ ] SRS algorithm: SM-2 vs FSRS (recommend evaluating FSRS)
- [ ] Junction table `item_topics` vs `topicIds[]` array on item
- [ ] Signed URL expiry duration for audio
- [ ] Default exam date exact day (early December 2026 — set when JLPT date confirmed)
- [ ] Supabase Realtime in v2 — needed or is delta sync sufficient?
- [ ] Audio offline cache strategy in v2 (Cache API vs IndexedDB blobs)
- [ ] Optional password encryption for JSON export backup

---

## 22. React + Vite Architecture & Best Practices

> **Goal:** Small, focused modules. No “god components” or 500-line files. Every file should have one clear job.

### 22.1 Size guidelines (soft limits — split when exceeded)

| Artifact | Target | Hard max | Action when exceeded |
|----------|--------|----------|----------------------|
| **React component** (`.tsx`) | ≤ 80 lines | 120 lines | Extract sub-components or a custom hook |
| **Custom hook** (`.ts`) | ≤ 60 lines | 100 lines | Split by responsibility |
| **Service / util module** | ≤ 150 lines | 250 lines | Split into focused modules |
| **Page / route component** | ≤ 100 lines | 150 lines | Compose from feature components only |
| **Type definition file** | ≤ 100 lines | — | Group by domain (`types/item.ts`, not one giant `types.ts`) |

These are guidelines, not dogma — but **default to splitting**, not merging.

### 22.2 Layered architecture

```
src/
├── app/                    # App shell, providers, router
├── pages/                  # Route-level components (thin)
├── features/               # Feature modules (domain logic + UI)
├── components/             # Shared, feature-agnostic UI
├── hooks/                  # Shared hooks (cross-feature)
├── lib/                    # Infrastructure: db, supabase, sync, srs
├── types/                  # Shared TypeScript types
└── utils/                  # Pure helpers (no React, no IO)
```

**Dependency rule (one direction only):**

```
pages → features → components
                 → hooks
                 → lib
                 → utils / types
```

- **`pages/`** — wire routing and layout; no business logic
- **`features/`** — self-contained domains (dashboard, search, import, review, …)
- **`components/`** — reusable UI (Button, Card, Modal, SearchInput)
- **`lib/`** — Dexie, Supabase client, sync engine, SRS — **no JSX**
- **`utils/`** — pure functions (date format, CSV parse, normalize Japanese text)

### 22.3 Feature module structure

Each feature lives in its own folder and owns its UI + hooks + local helpers:

```
src/features/search/
├── components/
│   ├── SearchBar.tsx
│   ├── SearchResults.tsx
│   ├── SearchResultGroup.tsx
│   └── SearchResultItem.tsx
├── hooks/
│   └── useSearch.ts
├── searchService.ts          # Dexie queries for search
├── searchTypes.ts            # feature-local types (if needed)
└── index.ts                  # public exports only
```

**Rules:**
- Other features import from `features/search/index.ts`, not deep paths
- Feature-specific logic stays inside the feature
- Cross-feature shared code moves to `components/`, `hooks/`, or `lib/`

### 22.4 Component design rules

1. **One component = one responsibility**  
   - `SearchBar` — input + debounce trigger  
   - `SearchResults` — grouped list  
   - `SearchResultItem` — single row  

2. **Pages compose, they don't implement**  
   ```tsx
   // ✅ pages/SearchPage.tsx — thin
   export function SearchPage() {
     return (
       <PageLayout title="Search">
         <SearchBar />
         <SearchResults />
       </PageLayout>
     );
   }
   ```

3. **Container vs presentational (lightweight)**  
   - Smart logic → custom hook (`useSearch`, `useReviewSession`)  
   - Dumb UI → props in, JSX out  

4. **No data fetching inside leaf components**  
   - Fetch in hooks or route loaders; pass data down  

5. **Extract when you see:**
   - More than one `useEffect` with unrelated concerns  
   - JSX blocks duplicated twice  
   - Conditional rendering nesting > 3 levels  
   - Component needs scroll — extract sections  

### 22.5 Custom hooks

- Prefix with `use` — `useSyncStatus`, `useDueReviews`, `useBulkImport`
- One hook = one concern (search, sync, SRS session)
- Hooks may call `lib/` services; they **must not** render JSX
- Return `{ data, isLoading, error, actions }` shape consistently

```typescript
// features/review/hooks/useReviewSession.ts
export function useReviewSession() {
  const [queue, setQueue] = useState<LearningItem[]>([]);
  // … load queue, grade card, advance
  return { queue, currentItem, grade, progress };
}
```

### 22.6 Service layer (`lib/`)

All IO and domain logic without React:

| Module | Responsibility |
|--------|----------------|
| `lib/db/` | Dexie schema, repositories (`itemRepository.ts`) |
| `lib/supabase/` | Client init, auth helpers |
| `lib/sync/` | Pull, push, merge, pending queue |
| `lib/srs/` | SM-2 / FSRS scheduling |
| `lib/import/` | CSV parse, validate, duplicate check |
| `lib/search/` | IndexedDB search queries |

**Repository pattern for Dexie:**

```typescript
// lib/db/repositories/itemRepository.ts
export async function findItemByJapanese(type: ItemType, japanese: string) { … }
export async function upsertItem(item: LearningItem) { … }
```

Components and hooks never touch Dexie tables directly — go through repositories.

### 22.7 State management

| State type | Tool |
|------------|------|
| Server / Supabase | TanStack Query (optional) or sync service + local Dexie |
| Local UI (modal open, tab) | `useState` in component or hook |
| Cross-route global (auth, sync status) | React Context (small providers) |
| Persistent app data | Dexie (source of truth offline) |

**Avoid:** Redux/Zustand unless a clear need emerges — Context + Dexie + hooks is enough for v1.

### 22.8 TypeScript conventions

- **`strict: true`** in `tsconfig`
- Domain types in `src/types/` mirroring [§8 Data Model](#8-data-model)
- No `any` — use `unknown` + narrowing
- Prefer `interface` for entity shapes, `type` for unions/utilities
- Co-locate prop types: `SearchBarProps` in same file as `SearchBar` (unless shared)

### 22.9 File naming

| Kind | Convention | Example |
|------|------------|---------|
| Component | PascalCase | `SearchResultItem.tsx` |
| Hook | camelCase, `use` prefix | `useSearch.ts` |
| Service / util | camelCase | `itemRepository.ts`, `parseCsv.ts` |
| Types | camelCase or domain | `learningItem.ts` |
| Test | same name + `.test.ts(x)` | `parseCsv.test.ts` |
| Constants | camelCase file, SCREAMING values | `routes.ts`, `MAX_REVIEW_BATCH` |

### 22.10 Routing (React Router)

```typescript
// app/routes.tsx
/                     → DashboardPage
/study                → StudyTodayPage
/learn/:skill         → LearnBrowsePage
/topics               → TopicsPage
/add                  → AddItemPage
/import               → BulkImportPage
/search               → SearchPage
/settings             → SettingsPage
/login                → LoginPage
```

- Lazy-load routes: `const DashboardPage = lazy(() => import('@/pages/DashboardPage'))`
- Protected routes wrapped in `<RequireAuth>`

### 22.11 Styling (Tailwind)

- Shared primitives in `components/ui/` (Button, Input, Card, Badge)
- Feature components use Tailwind utility classes
- Extract repeated class strings to constants or `cn()` helper — not new components for every div
- Dark mode: `dark:` variants, respect `AppSettings.theme`

### 22.12 Imports & aliases

```json
// tsconfig paths
"@/*": ["src/*"]
"@/features/*": ["src/features/*"]
"@/components/*": ["src/components/*"]
"@/lib/*": ["src/lib/*"]
```

- Use `@/` imports — no deep relative paths like `../../../`
- Feature public API via `index.ts` barrel — **one level only** (no barrel-of-barrels)

### 22.13 Error & loading UI

- Shared `<LoadingSpinner />`, `<ErrorMessage />`, `<EmptyState />`
- Every async hook exposes `isLoading` and `error`
- Route-level error boundary in app shell

### 22.14 Testing focus (when added)

| Layer | What to test |
|-------|--------------|
| `utils/`, `lib/` | Unit tests (pure logic, CSV, SRS, merge) |
| `hooks/` | `@testing-library/react` with mocked services |
| Components | User-visible behavior, not implementation |
| E2E (v2) | Critical paths: login, review, import, sync |

### 22.15 Vite & PWA specifics

- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — never commit secrets
- Code-split by route (`React.lazy`)
- PWA config in `vite.config.ts` — cache static assets; **do not** cache Supabase API blindly
- Dexie and sync logic stay out of service worker — SW for assets only in v1

### 22.16 Anti-patterns (do not)

- ❌ 300-line `DashboardPage.tsx` with fetch + chart + list + modal
- ❌ Dexie calls inside JSX or event handlers without a repository
- ❌ Copy-paste CSV parsing in a component — belongs in `lib/import/`
- ❌ `utils/` functions that import React
- ❌ Circular imports between features — extract shared code upward
- ❌ Giant `types.ts` with every entity — split by domain
- ❌ Premature abstraction (don't build a generic `<DataTable />` until 3 tables need it)

### 22.17 Example: review feature split

```
features/review/
├── components/
│   ├── ReviewCard.tsx          # displays one card (~40 lines)
│   ├── ReviewProgress.tsx      # progress bar
│   ├── ReviewActions.tsx       # grade buttons
│   └── ReviewComplete.tsx      # session summary
├── hooks/
│   └── useReviewSession.ts     # queue, grade, persist (~80 lines)
├── reviewService.ts            # load due items, save review
└── index.ts
```

Page:

```tsx
// pages/StudyTodayPage.tsx (~30 lines)
export function StudyTodayPage() {
  const session = useReviewSession();
  if (session.isComplete) return <ReviewComplete {...session} />;
  return (
    <PageLayout title="Study today">
      <ReviewProgress {...session} />
      <ReviewCard item={session.currentItem} />
      <ReviewActions onGrade={session.grade} />
    </PageLayout>
  );
}
```

### 22.18 Initial scaffold checklist

When creating the project:

- [ ] Vite + React + TypeScript template
- [ ] Tailwind CSS
- [ ] ESLint + Prettier
- [ ] Path aliases (`@/`)
- [ ] Folder structure per §22.2
- [ ] `vite-plugin-pwa`
- [ ] Strict TypeScript
- [ ] Placeholder feature folders: `dashboard`, `review`, `search`, `import`, `settings`, `learn`

---

## Appendix A: Chat decision log

| Date | Decision |
|------|----------|
| 2026-07-11 | App for JLPT N4 (Dec 2026), N5 recap, 5 skills, PWA Web+Android |
| 2026-07-11 | Private use only, no App Store |
| 2026-07-11 | Source-neutral — Genki is one source among many, not central |
| 2026-07-11 | Bulk import as primary content entry |
| 2026-07-11 | Global search: kanji, vocabulary, grammar, topics |
| 2026-07-11 | No Google services |
| 2026-07-11 | Regular device switching — automatic sync required |
| 2026-07-11 | Nextcloud initially proposed → replaced by Supabase (better for audio + PWA) |
| 2026-07-11 | Proton Drive rejected for primary sync; optional manual backup only |
| 2026-07-11 | Dexie.js confirmed for local IndexedDB |
| 2026-07-11 | Supabase EU region; Postgres + Storage + Auth + RLS |
| 2026-07-11 | **React + Vite** chosen; modular architecture conventions (§22) |

---

*End of implementation plan.*
