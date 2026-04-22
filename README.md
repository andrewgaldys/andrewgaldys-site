# Andrew Galdys Market Site

A clean static site for GitHub Pages that pulls your latest Substack posts into a branded personal domain.

## Quick setup

1. Open `config.js`
2. Replace:
   - `substackBaseUrl`
   - `substackFeedUrl`
   - `linkedinUrl` if needed
   - `aboutText` if you want
3. Push the repo to GitHub
4. Turn on GitHub Pages in repo settings
5. Run the GitHub Action called **Update Substack Posts** once
6. Add your custom domain in GitHub Pages settings
7. Update your DNS records at your domain registrar

## Local preview

You can preview the site with VS Code Live Server or any static file server.

## How auto-updating works

The GitHub Action runs every 30 minutes and updates `data/posts.json` from your Substack RSS feed.

## Files

- `index.html` main page
- `styles.css` styling
- `script.js` rendering logic
- `config.js` your editable settings
- `data/posts.json` cached posts for the front end
- `scripts/fetch-substack.mjs` RSS fetcher
- `.github/workflows/update-posts.yml` automation
