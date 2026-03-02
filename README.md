# DunstanPortfolio

Minimal, recruiter-focused portfolio site for a Project Manager with a Data Analyst background.

## Structure

- `index.html` → page content (About + Projects placeholders)
- `styles.css` → light Apple-esque styling
- `script.js` → small enhancements (footer year)

## Edit your content

Open `index.html` and update:

- Hero headline and intro text
- About paragraph
- Project cards (`h3`, project summaries, and KPI impact lines)

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

## Custom domain (when ready)

1. Buy or use an existing domain (for example, `yourname.com`).
2. In your DNS provider, add records:
	- For root domain (`yourname.com`): A records to GitHub Pages IPs
	  - `185.199.108.153`
	  - `185.199.109.153`
	  - `185.199.110.153`
	  - `185.199.111.153`
	- For `www` subdomain: CNAME to `<your-username>.github.io`
3. In GitHub repo **Settings → Pages**, set **Custom domain**.
4. Enable **Enforce HTTPS** (after DNS is validated).

Optional: add a `CNAME` file in the repo root containing your domain only, e.g.:

```text
yourname.com
```
