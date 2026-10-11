// Builds src/lib/data/crates.json from Apple's search API.
// The crates are hand-curated and rarely change, so they ship with the app
// instead of making ~16 API calls (and hitting Apple's rate limit) on every
// cold start. Run with: npm run crates
import { writeFileSync } from 'node:fs';
import { CRATES, artistTracks, mix } from '../src/lib/server/itunes.ts';

const crates = [];
for (const c of CRATES) {
	const per = c.artists.length === 1 ? 24 : 10;
	const lists = [];
	for (const a of c.artists) {
		lists.push(await artistTracks(a, per));
		await new Promise((r) => setTimeout(r, 3500)); // stay under ~20 calls a minute
	}
	const tracks = mix(lists, per).slice(0, 18);
	console.log(`${c.title}: ${tracks.length} songs`);
	crates.push({ slug: c.slug, title: c.title, blurb: c.blurb, tracks });
}
writeFileSync('src/lib/data/crates.json', JSON.stringify(crates, null, '\t') + '\n');
console.log('Wrote src/lib/data/crates.json');
