# Bigyan Rawal – portfolio website

Static HTML, CSS and JavaScript. No backend, no server code, no database, no build step.

## 1. Before you publish (five minutes)
1. **Contact details:** `js/config.js` holds your email, phone, WhatsApp link, Instagram, YouTube and TikTok (all filled in).
   Optional: `necReg` (your N.E.C. registration number) and `linkedin`. Anything left empty is hidden automatically, icon and all.
2. **CV:** save your CV as `assets/Bigyan_Rawal_CV.pdf`. The Download CV buttons appear once it's there.

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
| `js/config.js` | Email, phone, WhatsApp, social links, registration number, CV path |
| `assets/img/` | Portrait (WebP and JPG, two sizes each) |
| `assets/projects/featured/` | Featured project (Hillside campus): aerial, six views and the full board |
| `assets/projects/samples/` | Images for the auto-sliding "Latest works" strip |
| `404.html`, `favicon.svg`, `robots.txt`, `_headers`, `.nojekyll` | Hosting files |

## 4. Editing content
- **Page order:** hero name → profile (about) → featured project → latest works (auto-sliding) → what I do → edu & career → behind the lens → "Hire me!" footer with contact details.
- **Featured project:** the "Featured project" section of `index.html`. Change the title, text and facts there; images live in `assets/projects/featured/`.
- **Latest works:** put the image in `assets/projects/samples/`, then copy one `<li class="card …">` in the "Latest works" section and change its `src`, `alt`, `width`/`height`, `data-title`, `data-meta` and caption. `card--l`, `card--m` and `card--s` set the size, which gives the staggered look. Keep images about 2000 px wide or smaller. Slide timing is `--slide-time` in `css/style.css`.
- **Experience and education:** the "Career and education" section of `index.html`.
- **Colours:** the variables at the top of `css/style.css` (`--bg`, `--ink`, `--accent` …), with dark-theme values just below.

## 5. Built-in quality
- Responsive from phones to wide screens; light and dark themes following the visitor's system, with a toggle.
- Respects "reduce motion": no loader, no slideshow autoplay, no reveal animations.
- Keyboard accessible, with a skip link, visible focus and an accessible image viewer (Esc closes, arrow keys step through images).
- Search-friendly: real HTML text, meta description, Open Graph tags and schema.org Person data.
