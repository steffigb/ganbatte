# JLPT Grammar Data — Session Summary

**Project:** Ganbatte — JLPT N4/N5 learning app (repo: `github.com/steffigb/ganbatte`, local path `/Users/steffi/workspace/github.com/steffigb/ganbatte`)
**Goal of this session:** design and generate a grammar dataset (N5 + N4) to sit alongside the existing kanji/vocabulary CSVs.

---

## 1. Starting point

The app already had, before this session:
- `data/jlpt-n5-kanji.csv`, `data/jlpt-n4-kanji.csv`
- `data/jlpt-n5-vocabulary.csv`, `data/jlpt-n4-vocabulary.csv`
- A minimal `grammar-template.csv` with 3 hand-written seed rows

**Existing kanji/vocabulary schema (for reference):**
- Kanji: `type,level,skill,topics,japanese,meaning,onyomi,kunyomi,source,source_ref,tags`
- Vocabulary: `type,level,skill,topics,japanese,reading,meaning,part_of_speech,verb_type,transitivity,paired_with,example,example_reading,example_meaning,source,source_ref,tags,notes`
- No unique ID column anywhere — entries are identified by the `japanese` text field.
- Known duplicate `japanese` values (homographs): **8** in N5 vocab, **2** in N4 vocab, **0** in either kanji list (731 + 675 vocab rows total → ~0.7% collision rate).
- Vocab source: derived from `jamsinclair/open-anki-jlpt-decks` (originally from tanos.co.uk). Kanji source: tanos.co.uk.
- **Meaning/example fields are in English** (matches the open-source vocab data's convention).

**Original `grammar-template.csv` (3 seed rows, before this session's edits):**
```
type,level,skill,topics,japanese,reading,meaning,example,example_reading,example_meaning,source,source_ref,tags,notes
grammar,N4,grammar,te-form,てから,てから,nachdem,食べてから寝ます,たべてからねます,I sleep after eating,Try! N4,Unit 8,n4-grammar,
grammar,N4,grammar,obligation,なければならない,なければならない,müssen,宿題をしなければならない,しゅくだいをしなければならない,I have to do homework,Eigen,,,
grammar,N5,grammar,basic-polite,です,です,sein (höfliche Form),学生です,がくせいです,I am a student,,,,
```
Note: these 3 seed rows originally had **German** meanings and **no tilde (`〜`) prefix** on the patterns. Both points were resolved during this session (see decisions below).

---

## 2. Deliverables (in `/mnt/user-data/outputs/`)

| File | Contents |
|---|---|
| `jlpt-n5-grammar.csv` | 81 N5 grammar points, full schema |
| `jlpt-n4-grammar.csv` | 100 N4 grammar points, full schema |
| `grammar-template.csv` | Updated template: the same 3 original seed rows, now with tilde prefix + full new schema (reading, explanation, formation, related_vocabulary, related_kanji), original `source`/`source_ref`/`tags` preserved |
| `build_grammar_csv.py` | The generation script — Python, no external dependencies beyond stdlib `csv`. Loads the 4 uploaded vocab/kanji CSVs, cross-references example sentences against them, writes both grammar CSVs. **Re-run this if the underlying vocab/kanji CSVs change, or extend the `N5`/`N4`/`N5_EXPLANATIONS`/`N4_EXPLANATIONS`/`N5_READINGS`/`N4_READINGS` lists to add N3+ or more points.** |

### Final grammar CSV schema (column order)
```
type, level, skill, topics, japanese, reading, meaning, explanation, formation,
example, example_reading, example_meaning, related_vocabulary, related_kanji,
source, source_ref, tags, notes
```

Field notes:
- **`japanese`** — the grammar pattern itself, tilde-prefixed where it attaches to a stem (e.g. `〜てもいいです`). *(Open question — see §4.1: this may get renamed back to `pattern`.)*
- **`reading`** — hiragana reading of the `japanese` field itself (not the example sentence). For irregular-pronunciation particles this gives the actual sound, not the spelling (は→わ, へ→え, を→お).
- **`meaning`** — short one-line gloss, English.
- **`explanation`** — 2–5 sentences: usage nuance, when (not) to use it, and — critically — contrast with confusable sibling patterns (は/が, the そうです/ようです/らしい/でしょう/かもしれません/はず cluster, と/ば/たら/なら/ても conditionals, ために/ように, おかげで/せいで, ことにする/ことになる, わけではない/わけがない, あげる/くれる/もらう, etc.). English.
- **`formation`** — the grammatical construction rule (e.g. "Verb て form + もいいです").
- **`example` / `example_reading` / `example_meaning`** — one sentence with furigana and English translation, same convention as the vocab file.
- **`related_vocabulary` / `related_kanji`** — semicolon-separated, **auto-generated** by substring-matching the `example` sentence text against the real `japanese` columns of the 4 uploaded CSVs (N5 grammar checked only against N5 vocab/kanji; N4 grammar checked against N5+N4 cumulative). Coverage: 69/81 N5 rows and 92/100 N4 rows have ≥1 matched vocab word.
  - **Known limitation:** this is naive substring matching, not real tokenization — it can produce false positives from coincidental kana overlap (e.g. `いくら` was flagged inside `くらい` purely because the kana sequence happens to appear). A real fix would use a tokenizer (MeCab/Sudachi) instead of substring search.
- **`source` / `source_ref` / `tags`** — generic placeholder (`"Compiled from standard JLPT grammar references; cross-check against Genki/Minna no Nihongo/Bunpro recommended"`) for the 178 newly generated rows; the original attributions (`Try! N4`/Unit 8, `Eigen`) were preserved for the 3 merged seed rows.
- **`notes`** — short one-line warning/nuance, distinct from and shorter than `explanation`.

### Content sourcing
No single authoritative source exists for "the" JLPT grammar list (JLPT itself publishes none). The 181 points were compiled from general, standardized knowledge consistent with major references (Genki, Minna no Nihongo, Tae Kim, Bunpro, JLPTSensei) — cross-checking recommended against:
- **Genki I (3rd ed.)** → N5, **Genki II (3rd ed.)** → N4 (confirmed: grammar points unchanged from 2nd edition, only explanations revised; still maps to N5/A1 and N4/A2 respectively)
- **Minna no Nihongo 1** → N5, **Minna no Nihongo 2** → N4
- **Bunpro** (user has an account) — note: a ready-made "Genki II 3rd Edition [Grammar]" deck already exists on Bunpro matching that textbook's chapter order; worth checking for a Genki I equivalent too.

---

## 3. Key decisions made this session

1. **CSV, not JSON** — matches the existing data pipeline; no new tooling needed.
2. **Language: English** for `meaning`/`explanation`/`notes` — user explicitly chose this over German (the original 3 seed rows happened to be German, but that wasn't a deliberate policy).
3. **Field order and naming aligned to the real `grammar-template.csv`** once it was shared — `example`/`example_reading`/`example_meaning`/`source`/`source_ref`/`tags`/`notes` positions match; `reading` (separate from the pattern text) was added because the template already had it.
4. **`related_vocabulary`/`related_kanji` as plain semicolon-separated text, resolved via runtime/build-time lookup — not a persistent junction table (for now).** Rationale: homograph collision rate is only ~0.7% in vocab and 0% in kanji; a junction table needs an import pipeline with ID generation and disambiguation logic that doesn't exist yet, for marginal benefit at this collision rate. Recommended middle ground: cache the resolved lookup once at build/app-start (not repeated per-render text search), and manually clean up the ~10 known duplicate vocab entries. Revisit a real junction table if reverse queries ("which grammar points reference this vocab word") are needed, or if N3+ raises the collision rate materially.
5. **Grammar schema should become the standard going forward, not stay as a minimal template with optional aliases** — but paired with the understanding that "standard" includes the generation tooling (this script / an LLM-assisted step), not an expectation that all 18 columns get filled by hand for future entries.
6. **Tilde (`〜`) prefix used consistently** on all patterns that attach to a stem — added retroactively to the 3 original template rows to match.
7. **The 3 original template rows were merged, not duplicated** — same `japanese` text, original `source`/`source_ref`/`tags` preserved, richer fields (`explanation`, `formation`, `related_*`) added from the generated dataset.

---

## 4. Open / unresolved questions

### 4.1 `japanese` vs. `pattern` as the field name
Currently named `japanese` for consistency with the existing template and kanji/vocab files. Claude's actual recommendation: rename to **`pattern`**, since grammar entries aren't literal vocabulary words but structural templates with placeholders/tildes, and grammar already has enough extra fields (`formation`, `explanation`, `related_*`) that it likely doesn't share a fully generic `Item` interface with kanji/vocab anyway. **Decision depends on whether the app code has a shared generic type/component across all 4 content types** (e.g. does something like `KanjiCompoundsList` or a generic search/render component access `.japanese` uniformly across kanji, vocab, and grammar?). Not yet resolved — pending a look at the actual app code.

### 4.2 Topic taxonomy alignment
This session's generated topics (e.g. `te-form-extensions`, `copula`) don't exactly match the 3 original template rows' topics (`te-form`, `basic-polite`). Not reconciled — only 3 real examples existed, not enough to know if e.g. `basic-polite` is meant as a broader bucket (potentially including `〜ます` forms too, which are currently under `verb-forms`) or just an ad-hoc label. **Needs the full intended topic taxonomy from the app/repo to resolve properly.**

### 4.3 Repo access
Attempted to connect a GitHub connector to inspect the actual repo (`github.com/steffigb/ganbatte`) — the connector opt-in prompt did not appear to complete on the user's side. A local file system path (`/Users/steffi/workspace/...`) is **not** accessible from this chat interface (unlike Claude Code, which runs locally) — only two paths work: (a) a properly authorized GitHub connector, or (b) manually uploading specific files (e.g. the `Item` type definition, the `KanjiCompoundsList` component) the way the CSVs were uploaded. Neither has happened yet — this blocks a grounded answer to §4.1 and §4.2.

---

## 5. Suggested next steps
1. Resolve repo access (connector or manual file upload) to settle §4.1 and §4.2 with actual code visibility rather than guesswork.
2. Manually review/disambiguate the 10 known duplicate vocab entries (`一日`, `九`, `～時`, `十`, `～中`, `～人`, `外`, `私` in N5; `止める`, `空く` in N4).
3. Decide whether to extend the same pipeline to N3 (would reuse `build_grammar_csv.py` directly — same cross-referencing logic, just needs new `N3` / `N3_EXPLANATIONS` / `N3_READINGS` data plus the N3 vocab/kanji CSVs as matching pools).
4. If `related_vocabulary`/`related_kanji` matching quality matters more later, swap the naive substring matcher in `build_grammar_csv.py` for a real Japanese tokenizer (MeCab/Sudachi).
