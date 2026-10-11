# Crate

**Dig through crates of music and play any song on a spinning turntable that reacts to the sound.**

Live: https://crate-rahul.vercel.app

Crate started as the Spotify clone I built in plain HTML/CSS while learning front end. This version is a real music app in **SvelteKit 3 and Svelte 5**: real songs and charts from Apple, a 30-second preview of every track, and a live audio visualizer built on the Web Audio API.

## Features

- **The turntable.** Open any song full-screen. The record spins with the album art as its label, the tonearm swings onto the record when it plays, and a ring of bars around the record moves with the real frequencies of the song.
- **Crates.** Hand-picked rows (Bollywood heartbreak, Blue Note jazz, 90s hip-hop, indie, electronic, A. R. Rahman), each with shuffle.
- **Live US chart.** Apple Music's most-played songs, refreshed every hour.
- **Search** across Apple's whole catalog, as you type.
- **Album pages, likes and a queue.** Play next, previous and next, and liked songs saved in the browser.
- **Works like a real player.** Keyboard shortcuts (Space, ← →, N, P, T), lock-screen and headphone controls (Media Session API), and a dock that follows you across pages.

## Tech

| | |
|---|---|
| Framework | **SvelteKit 3**, **Svelte 5** runes (`$state`, `$derived`, `$effect`) |
| Server calls | SvelteKit **remote functions** (`query`) validated with **valibot** |
| Audio | HTML audio + **Web Audio API** `AnalyserNode`, drawn on a `<canvas>` |
| Styling | **Tailwind CSS 4**, Syne + Manrope, Lucide icons |
| Data | Apple iTunes Search API and Apple Music RSS charts (no API key) |
| Hosting | Vercel, with **Incremental Static Regeneration** per page |

## How it works

**One player for the whole app.** `src/lib/player.svelte.ts` is a class whose fields are Svelte 5 `$state`. The queue, current song, play state, time and likes all live there. Any component reads `player.current` or `player.playing` and updates on its own; there's no store boilerplate.

**The visualizer.** On the first play, the player connects the `<audio>` element to an `AudioContext` → `AnalyserNode` → speakers. Every animation frame, `Visualizer.svelte` reads 128 frequency bins with `getByteFrequencyData`, smooths them, mirrors them and draws 96 bars around a circle. This works because Apple's preview files send `Access-Control-Allow-Origin: *`, and the audio element is set to `crossOrigin="anonymous"`.

**Remote functions.** Search is a SvelteKit remote function:

```ts
export const search = query(v.pipe(v.string(), v.trim(), v.minLength(2), v.maxLength(80)), (q) => searchTracks(q, 40));
```

The search page calls `await search(term)` like a local function. SvelteKit generates the fetch, valibot checks the input on the server, and the result is typed end to end.

**Caching, and Apple's rate limit.** Apple allows about 20 calls a minute and answers bursts with a 403.
- The server allows two calls at a time, retries once after a pause, and gives up after 8 seconds.
- Home, chart and album pages use Vercel ISR (`export const config = { isr: { expiration: 3600 } }`), so Apple is called at most about once an hour per page.
- The hand-picked crates are generated once by `npm run crates` (`scripts/build-crates.ts`) and ship as JSON, so a cold start never makes 16 calls at once.

**Keeping it honest.** Songs come from artist searches (`attribute=artistTerm`), not keyword searches that return "type beat" uploads. Collaborations are de-duplicated by track ID.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run crates     # rebuild the crate data from Apple
npm run check      # svelte-check (TypeScript)
```

No API keys needed.

Music data, artwork and previews belong to their owners and are served by Apple. Crate is a portfolio project.

## License

MIT © Rahul Singh
