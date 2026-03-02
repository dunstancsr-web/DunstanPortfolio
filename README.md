# DunstanPortfolio

Recruiter-focused portfolio site for a Project Manager with a Data Analyst background.

## Structure

- `index.html` → page content (About + Projects placeholders)
- `styles.css` → light Apple-esque styling
- `script.js` → small enhancements (footer year)

## Edit your content

Open `index.html` and update:

- Hero intro and subtitle
- About paragraph
- Project cards (`h3`, summary, role, impact, tools, links)

Tip: keep each project to **Role + Action + Measurable Impact + Tools** for fast recruiter scanning.

## Run locally

You can open `index.html` directly in your browser, or use a local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push this repo to GitHub.
2. In GitHub repo settings: **Pages**.
3. Under **Build and deployment**, choose:
	- Source: **Deploy from a branch**
	- Branch: `main` (or your default branch), folder `/ (root)`
4. Save and wait for deployment.

Your site will appear at:

- `https://<your-username>.github.io/DunstanPortfolio/`
