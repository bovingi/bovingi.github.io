"""Refresh data/publications.json from OpenAlex using Indra's ORCID.

Run by .github/workflows/update-publications.yml every week; can also be run
locally with `python3 scripts/update_publications.py` (standard library only).
"""

import json
import re
import urllib.request
from pathlib import Path

ORCID = "0000-0002-2176-2819"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "publications.json"
NOTES = ROOT / "data" / "publication-notes.json"

# Sources that hold data/code deposits rather than papers
DATA_SOURCES = ("zenodo", "dryad", "figshare", "daac")


def fetch_works():
    works, cursor = [], "*"
    while cursor:
        url = (
            "https://api.openalex.org/works"
            f"?filter=author.orcid:{ORCID}&per_page=200&cursor={cursor}"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "indra-boving-website"})
        with urllib.request.urlopen(req, timeout=60) as r:
            page = json.load(r)
        works += page["results"]
        cursor = page["meta"].get("next_cursor")
        if not page["results"]:
            break
    return works


def clean(text):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text or "")).strip()


def category(work, venue):
    kind = work.get("type")
    if kind == "dataset" or any(s in venue.lower() for s in DATA_SOURCES):
        return "Data"
    if kind == "preprint":
        return "Preprints"
    if kind == "dissertation":
        return "Theses"
    return "Peer-reviewed articles"


def main():
    notes = json.loads(NOTES.read_text()) if NOTES.exists() else {}
    pubs, seen = [], set()
    for w in fetch_works():
        title = clean(w.get("title"))
        key = title.lower()
        if not title or key in seen:
            continue
        seen.add(key)
        loc = w.get("primary_location") or {}
        venue = clean((loc.get("source") or {}).get("display_name"))
        doi = w.get("doi")
        pubs.append({
            "title": title,
            "authors": [clean(a["author"]["display_name"]) for a in w.get("authorships", [])],
            "year": w.get("publication_year"),
            "date": w.get("publication_date"),
            "venue": venue,
            "url": doi or loc.get("landing_page_url") or w.get("id"),
            "doi": doi,
            "category": category(w, venue),
            "cited_by": w.get("cited_by_count", 0),
            "note": notes.get(doi or "", ""),
        })
    pubs.sort(key=lambda p: p["date"] or "", reverse=True)

    OUT.parent.mkdir(exist_ok=True)
    new = json.dumps({"orcid": ORCID, "publications": pubs}, indent=2, ensure_ascii=False) + "\n"
    if OUT.exists() and OUT.read_text() == new:
        print("No changes")
        return
    OUT.write_text(new)
    print(f"Wrote {len(pubs)} publications")


if __name__ == "__main__":
    main()
