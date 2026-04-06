# Netlify Deployment

## Quick Deploy

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Log in to [app.netlify.com](https://app.netlify.com) and click **Add new site → Import an existing project**.
3. Select the repository.
4. Netlify auto-detects **`netlify.toml`** in the project root — no extra configuration needed.

## Build Settings (auto-detected via netlify.toml)

| Setting          | Value         |
|------------------|---------------|
| Build command    | `npm run build` |
| Publish directory | `dist`       |
| Node version     | 20            |

## SPA Routing

The `[[redirects]]` rule in `netlify.toml` ensures all routes (e.g. `/documents/123`) are served by `index.html` so React Router works correctly.

## Environment Variables

All data is stored client-side in IndexedDB — no server-side env vars are required for the base app.

If you add backend integrations later, set env vars in **Netlify → Site settings → Environment variables**.
