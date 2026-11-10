# sanctuary5studios.github.io
Official site for Sanctuary Five Studios (SFS), sanctuaryfivestudios.com.

Plain static HTML on GitHub Pages: no build step, no dependencies.

## Pages
- `index.html` Home (services overview, selected projects, how we work, solution finder)
- `software.html`, `ai.html`, `systems.html` Service pages
- `interactive.html` SFS Interactive (games & digital products division)
- `snuggle-sanctuary.html` Snuggle Sanctuary project page
- `world-travel-adventures.html` World Travel Adventures game page (images in `img/world-travel-adventures/`)
- `snuggle-hollow.html` Snuggle Hollow game page (images in `img/snuggle-hollow/`); its hero is an illustrated, animated SVG valley that follows the visitor's time of day (styles under "Snuggle Hollow" in `assets/site.css`)
- `lab.html` Innovation Lab (project showcase with status filters)
- `about.html` About SFS
- `partnerships.html` Partnerships & Investment Enquiries (expression of interest only)
- `contact.html` Contact form
- `privacy-notice.html` Website privacy notice
- `testers.html`, `privacy.html`, `account-deletion.html` Snuggle Sanctuary pages
- `404.html`, `sitemap.xml`, `robots.txt`

## Shared code
- `assets/site.css` Design system (dark navy by default, light theme via the toggle)
- `assets/site.js` Interactions and enquiry delivery

## Enquiry forms
All forms send through one function in `assets/site.js`. Set `SFS_CONFIG.formEndpoint`
at the top of that file to a Formspree (or compatible) form URL, for example
`https://formspree.io/f/xxxxxxxx`. That URL is public by design, so it contains no secrets.
While it is empty, forms open the visitor's email app with the enquiry pre-filled.
