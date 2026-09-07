# KYVORIX — Production Build

Production assets are isolated in `public/`.

## Deploy

```bash
npm install
npm run deploy
```

## GitHub deployment

The repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.
After creating a GitHub repository, add these repository secrets:

- `CLOUDFLARE_API_TOKEN` — Cloudflare API token with Workers Scripts edit permission.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account ID that owns the `kyvorix` Worker.

In GitHub, open **Settings > Secrets and variables > Actions > New repository secret**.
The API token should be created in Cloudflare under **My Profile > API Tokens**
with permission to edit Workers Scripts for the account that owns `kyvorix`.

Every push to `main` will deploy the contents of `public/` through Wrangler to
the custom domain configured in `wrangler.jsonc`.

Backups, audits and documentation from the source backup are intentionally excluded from the deploy package.


See FINAL_AUDIT.md for the final automated audit.
