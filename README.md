# Bugdle

[Play Bugdle](https://bugdle.pages.dev/)

Bugdle is a single-player code review game with six hand-reviewed JavaScript, TypeScript, and Python puzzles. Pick a puzzle, read the intended behavior, and select one line for each bug. You have five guesses. Each guess reports how many lines match. Finishing the puzzle reveals the answers and explanations.

## Playing locally

Use Node.js 24 LTS and npm. From the repository root, run:

```sh
npm ci
npm run dev
```

Open [the development server](http://127.0.0.1:5173). Click or tap a source line to select it, or use Tab and Enter or Space. Each puzzle saves submitted guesses in the browser's local storage. Progress is specific to the browser and site address. Replay clears the selected puzzle.

## Testing the release build

```sh
npm test
npm run build
npm run backend
```

Vitest checks the fixtures, game rules, interactions, navigation, and save recovery. The build type-checks the project and writes static assets to `dist/`. The local preview uses Python 3 to serve that folder at [port 4173](http://127.0.0.1:4173). Production serves the same files directly.

## Publishing to Cloudflare Pages

The production site uses Cloudflare Pages Direct Upload. Cloudflare serves it on the assigned `bugdle.pages.dev` address. A custom domain can be connected later.

To publish an update from an authorized Cloudflare account, run these commands from the repository root. Sign in with `npx wrangler@4 login` if needed.

```sh
npm test
npm run build
npx wrangler@4 pages deploy dist --project-name bugdle --branch main
```

After publishing, open the production URL, play a puzzle, and refresh to check its saved history. Future releases use the same project and URL. [Cloudflare Direct Upload guide](https://developers.cloudflare.com/pages/get-started/direct-upload/)
