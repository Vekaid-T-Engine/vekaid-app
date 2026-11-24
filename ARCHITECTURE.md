# VEKAID Architecture

## Product model

VEKAID is a personal engineering operating system centered on four loops:

1. **Plan** — projects and technical missions.
2. **Build** — implementation, tools, agents, media and systems.
3. **Learn** — skills, labs and challenges.
4. **Prove** — evidence, portfolio, release and professional visibility.

## Runtime

- **Frontend:** HTML/CSS/JavaScript.
- **PWA:** manifest + Service Worker.
- **Data:** local browser storage, with V23 structured data in IndexedDB.
- **Hosting:** GitHub Pages.
- **Deployment:** commits to `main` trigger GitHub Pages.
- **Quality:** GitHub Actions runs the VEKAID Quality Gate.

## Boundaries

The public app must not contain credentials or private personal data.

Heavy local tools such as Unreal Engine, Ollama or Windows-only clients are represented and orchestrated conceptually in the iPhone interface, but VEKAID must not claim they are running unless a verified connection exists.

## Evolution target

The legacy monolithic `index.html` will be reduced progressively. New features should live in dedicated modules rather than adding more inline code.
