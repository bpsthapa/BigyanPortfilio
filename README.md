# Bigyan Rawal – portfolio website

Static HTML, CSS and JavaScript. No backend, no server code, no database, no build step.

## 1. Before you publish (five minutes)
1. **Contact details:** open `js/config.js` and fill in `email` and `phone`. YouTube and TikTok are already filled in.
   Optional: `necReg` (your N.E.C. registration number), `instagram`, `linkedin`. Anything left empty is hidden automatically.
2. **CV:** save your CV as `assets/Bigyan_Rawal_CV.pdf`. The Download CV buttons appear once it's there.
3. **Project images (recommended):** add renders or photos to `assets/projects/` with these names:
   `art-center.jpg`, `pet-in-zoo.jpg`, `juddha-barun-yantra.jpg`, `ward-office.jpg`.
   Each one automatically replaces that project's illustrative line drawing.

Preview locally by double-clicking `index.html`.

## 2. Deploy (free)
- **Netlify:** go to app.netlify.com/drop and drag in this whole folder. You get a live link in seconds and can add your own domain later.
- **Cloudflare Pages:** Workers & Pages → Create → Pages → Upload assets → drag in the folder.
- **GitHub Pages:** upload the folder's contents (including the hidden `.nojekyll` file) to a repository, then Settings → Pages → Deploy from branch → `main` / root.

## 3. What's in the folder
| File | Purpose |
|---|---|
| `index.html` | Page content |
| `css/style.css` | All styling, light and dark themes |
| `js/main.js` | Animations and interactions |
| `js/config.js` | Email, phone, social links, registration number, CV path |
| `assets/img/` | Portrait (WebP and JPG, two sizes each) |
| `assets/projects/` | Project renders go here |
| `assets/projects/samples/` | Images for the "Project samples" gallery |
| `404.html`, `favicon.svg`, `robots.txt`, `_headers`, `.nojekyll` | Hosting files |

## 4. Editing content
- **Projects:** each project is an `<article class="work-card">` in `index.html`, with its details in a matching `<template id="p-…">` near the end of the file. To add a project, copy both and give them a new id.
- **Project samples:** put the image in `assets/projects/samples/`, then copy one `<li>` in the "Project samples" section of `index.html` and change its `src`, `alt`, `width`/`height`, title and caption. Keep images about 2000 px wide or smaller.
- **Experience and education:** the "Career and education" section of `index.html`.
- **Colours:** the variables at the top of `css/style.css` (`--bg`, `--ink`, `--brass` …), with dark-theme values just below.

## 5. Built-in quality
- Responsive from phones to wide screens; light and dark themes following the visitor's system, with a toggle.
- Respects "reduce motion": no loader, drawings shown complete, no reveal animations.
- Keyboard accessible, with a skip link, visible focus and an accessible project dialog (Esc closes).
- Search-friendly: real HTML text, meta description, Open Graph tags and schema.org Person data.
