// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
}

// Community photo gallery (home page)
const stage = document.querySelector(".gallery-stage img");
const thumbs = [...document.querySelectorAll(".thumbs button")];
if (stage && thumbs.length) {
  let current = 0;
  const show = (i) => {
    current = (i + thumbs.length) % thumbs.length;
    const img = thumbs[current].querySelector("img");
    stage.src = img.src;
    stage.alt = img.alt;
    thumbs.forEach((t, j) => t.setAttribute("aria-current", j === current));
    thumbs[current].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };
  thumbs.forEach((t, i) => t.addEventListener("click", () => show(i)));
  document.querySelector(".gallery-btn.prev").addEventListener("click", () => show(current - 1));
  document.querySelector(".gallery-btn.next").addEventListener("click", () => show(current + 1));
}

// Publications page: rendered from data/publications.json (refreshed weekly by a GitHub Action)
const pubList = document.getElementById("pub-list");
if (pubList) {
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };
  fetch("data/publications.json")
    .then((r) => r.json())
    .then(({ publications }) => {
      pubList.replaceChildren();
      const order = ["Peer-reviewed articles", "Preprints", "Theses", "Data"];
      for (const cat of order) {
        const items = publications.filter((p) => p.category === cat);
        if (!items.length) continue;
        pubList.append(el("h2", "pub-cat", cat));
        for (const p of items) {
          const item = el("article", "pub");
          item.append(el("span", "pub-year", p.year));
          const body = el("div");
          const title = el("a", "pub-title", p.title);
          title.href = p.url;
          const authors = el("p", "pub-authors");
          // Long consortium author lists: first five, then Indra, then "et al."
          const me = p.authors.findIndex((n) => /boving/i.test(n));
          let names = p.authors;
          if (names.length > 10) {
            names = names.slice(0, 5);
            if (me >= 5) names.push("…", p.authors[me]);
            names.push("et al.");
          }
          names.forEach((name, i) => {
            authors.append(/boving/i.test(name) ? el("strong", "", name) : name);
            if (i < names.length - 1) authors.append(name === "…" ? " " : ", ");
          });
          body.append(title, authors, el("p", "pub-venue", p.venue));
          if (p.note) body.append(el("p", "pub-note", p.note));
          item.append(body);
          pubList.append(item);
        }
      }
    })
    .catch(() => {
      pubList.replaceChildren(el("p", "meta", "Publications could not be loaded. "));
      const a = el("a", "", "View them on ORCID.");
      a.href = "https://orcid.org/0000-0002-2176-2819";
      pubList.firstChild.append(a);
    });
}
