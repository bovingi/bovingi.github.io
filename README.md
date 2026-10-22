# Indra Boving — personal website

Static site (plain HTML/CSS/JS) for GitHub Pages, rebuilt from the old Wix site.

## Structure

- `index.html`, `about.html`, `publications.html`, `news.html`, `data.html`, `post-*.html` — pages
- `css/style.css` — all styles; colors and fonts are variables at the top
- `js/main.js` — mobile menu, home-page photo gallery, publications renderer
- `images/` — photos
- `data/publications.json` — generated; don't edit by hand
- `data/publication-notes.json` — optional badges shown under a paper, keyed by DOI

The header and footer are repeated in every page, so a nav or footer change has to be made in each `.html` file.

## Publications auto-update

`.github/workflows/update-publications.yml` runs every Monday. It calls
`scripts/update_publications.py`, which pulls works for ORCID 0000-0002-2176-2819
from OpenAlex and commits `data/publications.json` if anything changed. To run it
immediately: GitHub → Actions → Update publications → Run workflow.

New papers appear once OpenAlex indexes them (usually days to a few weeks after
publication). Keeping your ORCID record current helps.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000 (the publications list needs a server, not file://).

## Publish

1. Create a repo named `<your-github-username>.github.io` (or any name, which will serve at `<username>.github.io/<repo>`).
2. Push this folder to it.
3. Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. Settings → Actions → General → Workflow permissions: "Read and write permissions" (lets the publications job commit).
