# Bugdle

A browser puzzle about finding buggy lines in short code snippets. Phase 1 provides the app shell and development tooling.

## Local development

Install dependencies with `npm ci`, then run `npm run dev` to open the development server at http://127.0.0.1:5173.

Run `npm test` for the React smoke test. Run `npm run build` to type-check the project and generate the static site in `dist/`.

To check the built site, run `npm run backend` after building and visit http://127.0.0.1:4173. This local server uses Python 3's standard library. Rebuild after source changes to refresh the files it serves.

## Cloudflare Pages

Use the repository root as the project directory, `npm run build` as the build command, and `dist` as the output directory. Gameplay will run in the browser.
