# Simplified Warframe Star Chart - Prototype

This is a GitHub Pages-ready prototype build containing:
- index.html, styles.css, app.js
- achievements.json (copied from your uploaded file)
- config.json
- assets/planet_screenshot.png (your provided screenshot if available)

Features implemented:
- Monochrome starfield background
- 5 core planets laid out in a ring around a central geometric image
- Click to zoom (opens side panel) and view achievements loaded from achievements.json
- Node states (locked/available/completed) displayed; ability to mark complete
- Client-side Admin editor (password "letmein" for prototype) to edit and download JSON
- Configurable values are in config.json

Notes:
- Some advanced visual effects (SVG projector scan, Warframe-exact font) are approximated with web-safe fonts and CSS for portability.
- All external assets (audio and some icons) reference the catbox URLs you provided.
- Planets are NOT animated to spin (per your last request).

To run:
1. Upload to GitHub Pages (root or gh-pages branch)
2. Open index.html in the browser

