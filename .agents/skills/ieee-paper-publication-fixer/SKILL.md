---
name: ieee-paper-publication-fixer
description: Audits and fixes AI content, plagiarism similarity, IEEE formatting, citations, structure, figures, ethics, and submission issues for paper publication. Not just check — fix.
---

# IEEE Paper Publication Fixer

## Purpose
Not just check. Fix every issue that blocks IEEE publication.

## Inputs
- MANUSCRIPT
- TARGET_VENUE
- CITATION_STYLE (default IEEE)
- REFERENCE_CORPUS
- AUTHOR_PRIOR_WORK
- PAGE_LIMIT
- TEMPLATE
- OUTPUT_MODE

## Global Rules
- Never fabricate data, citations, authors, results.
- Preserve technical meaning, equations, numbers, terms.
- Fix by legitimate means: cite, quote, paraphrase with attribution, rewrite, format.
- Do not merely swap synonyms to hide similarity.
- If source is missing, insert [CITATION NEEDED] and flag.
- Output dry, terminal-style.
- Re-run all checks after fixes.

## Workflow
1. AI content audit and fix.
2. Plagiarism similarity audit and fix.
3. IEEE format and compliance fix.
4. Structure and writing fix.
5. Citation and reference fix.
6. Figure, table, equation fix.
7. Ethics and submission fix.
8. Final verification.

## 1. AI Content Audit and Fix
Detect:
- Formulaic transitions
- Uniform sentence rhythm
- Inflated significance
- Promotional language
- Empty hedging
- Bullet-point symmetry
- Chat artifacts
- Invisible Unicode residue

Score each paragraph 0–100 for AI-likeness.
Rewrite flagged spans:
- Vary sentence length.
- Remove formulaic transitions.
- Replace inflated claims with neutral wording.
- Use active voice where agent is known.
- Add concrete detail only if already present in text.
- Remove chat artifacts and invisible Unicode.

Recompute AI percentage.
Target: <20% or report residual.

Output: paragraph scores, before/after, rewritten spans.

## 2. Plagiarism Similarity Audit and Fix
Compare against REFERENCE_CORPUS.
If no corpus supplied, run internal citation alignment only.

Detect:
- Exact matches ≥8 consecutive words
- Near matches ≥85% token overlap
- Uncited claims
- Self-plagiarism

Fix:
- Exact match: quote + cite, or substantive rewrite + cite.
- Near match: paraphrase with attribution.
- Self-plagiarism: cite prior work or rewrite.
- Uncited claim: add citation from reference list if available; else [CITATION NEEDED].

Do not invent sources.
Recompute similarity index.

Output: Match ID, source, span, type, length, citation, fix applied.

## 3. IEEE Format and Compliance Fix
- IEEEtran, two-column, 10 pt Times.
- Abstract: 150–250 words.
- Index Terms: alphabetical.
- Section numbering: I, II, III.
- Figure captions below figures.
- Table captions above tables.
- Equations numbered right-aligned.
- References IEEE style, numbered by citation order.
- Page limit.
- Author info, affiliations, emails.

Fix all deviations.
If page limit exceeded, suggest cuts and mark.

## 4. Structure and Writing Fix
- Abstract: problem, method, key result, conclusion.
- Introduction: motivation, problem, contributions, organization.
- Related Work: gap, comparison.
- Methodology: reproducible, equations, pseudocode, parameters.
- Results: baselines, metrics, significance, error bars.
- Discussion: interpretation, limitations, threats.
- Conclusion: summary, future work.

Fix grammar, tense, voice, clarity, flow.
Flag missing data.

## 5. Citation and Reference Fix
- Every in-text citation appears in reference list.
- Every reference is cited.
- Fix authors, year, venue, DOI, pages.
- Remove predatory or irrelevant citations.
- Ensure IEEE style.

Output: citation integrity table.

## 6. Figure, Table, Equation Fix
- Numbered and referenced in text.
- Captions sentence case.
- Grayscale readable.
- Vector where possible.
- Labels, units, legends.
- Equations numbered and consistent notation.

Fix captions, references, labels.

## 7. Ethics and Submission Fix
- Authorship
- Conflict of interest
- Data availability
- Funding
- Plagiarism, fabrication, duplication
- Copyright transfer
- ORCID
- Supplementary material

Fix declarations and checklist.

## 8. Final Verification
Re-run all audits.

Output:
- AI before/after
- Similarity before/after
- Format compliance
- Citation integrity
- Page count
- Residual risks requiring author input

## Output Format
REVISED MANUSCRIPT
[full revised text]

CHANGE LOG
| Issue | Location | Original | Fixed | Reason | Status |

METRICS
AI before: XX%
AI after: XX%
Similarity before: XX%
Similarity after: XX%
Format compliance: XX%
Citation integrity: XX%
Page count: N / LIMIT

RESIDUAL RISKS
- [item]

## Commands
- "fix all" → run full workflow.
- "ai only" → section 1.
- "plag only" → section 2.
- "format only" → section 3.
- "citations only" → section 5.
- "final report" → section 8.

## Missing Input Behavior
If MANUSCRIPT empty: output "MANUSCRIPT field is empty."
If TARGET_VENUE missing: default "IEEE generic".
If CITATION_STYLE missing: default "IEEE".
If REFERENCE_CORPUS missing: output "No reference corpus supplied. Similarity check limited to internal citation alignment."

## Antigravity Placement
Save as:
`.agents/skills/ieee-paper-publication-fixer/SKILL.md`

Global:
`~/.gemini/config/skills/ieee-paper-publication-fixer/SKILL.md`
