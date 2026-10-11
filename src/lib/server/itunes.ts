import type { Track, Crate } from '#lib/types.ts';
import crateData from '#lib/data/crates.json' with { type: 'json' };

// Apple's public iTunes Search API: no key needed, every song has a free
// 30-second preview. Results are cached on the server for an hour.

type Raw = {
	wrapperType?: string;
	kind?: string;
	trackId?: number;
	trackName?: string;
	artistName?: string;
	artistId?: number;
	collectionName?: string;
	collectionId?: number;
	artworkUrl100?: string;
	previewUrl?: string;
	trackTimeMillis?: number;
	primaryGenreName?: string;
	releaseDate?: string;
};

const cache = new Map<string, { at: number; data: unknown }>();
const HOUR = 60 * 60 * 1000;

async function cached<T>(key: string, load: () => Promise<T>, ttl = HOUR): Promise<T> {
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < ttl) return hit.data as T;
	const data = await load();
	cache.set(key, { at: Date.now(), data });
	return data;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Apple rate-limits bursts (about 20 calls a minute) with a 403, so allow
// two calls at a time and retry once after a pause.
let active = 0;
const waiting: (() => void)[] = [];
async function slot<T>(fn: () => Promise<T>): Promise<T> {
	if (active >= 2) await new Promise<void>((r) => waiting.push(r));
	active++;
	try {
		return await fn();
	} finally {
		active--;
		waiting.shift()?.();
	}
}

async function getJson<T>(url: string, retry = true): Promise<T> {
	const res = await slot(() => fetch(url, { signal: AbortSignal.timeout(8000) }));
	if ((res.status === 403 || res.status === 429 || res.status >= 500) && retry) {
		await sleep(1500);
		return getJson<T>(url, false);
	}
	if (!res.ok) throw new Error(`Apple API ${res.status}`);
	return res.json() as Promise<T>;
}

const bigArt = (url = '') => url.replace(/\/\d+x\d+bb\./, '/600x600bb.');

export function toTrack(r: Raw): Track | null {
	if (r.kind !== 'song' || !r.trackId || !r.previewUrl) return null;
	return {
		id: r.trackId,
		title: r.trackName ?? 'Untitled',
		artist: r.artistName ?? 'Unknown artist',
		artistId: r.artistId ?? null,
		album: r.collectionName ?? '',
		albumId: r.collectionId ?? null,
		art: bigArt(r.artworkUrl100),
		artSmall: r.artworkUrl100 ?? '',
		preview: r.previewUrl,
		durationMs: r.trackTimeMillis ?? 30000,
		genre: r.primaryGenreName ?? '',
		year: r.releaseDate?.slice(0, 4) ?? null
	};
}

const tracksFrom = (results: Raw[]) => {
	const seen = new Set<string>();
	return results
		.map(toTrack)
		.filter((t): t is Track => !!t)
		.filter((t) => {
			// the same song often appears on several albums; keep one
			const k = `${t.title.toLowerCase()}|${t.artist.toLowerCase()}`;
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
};

export function searchTracks(term: string, limit = 30) {
	const q = term.trim().toLowerCase();
	return cached(`s:${q}:${limit}`, async () => {
		const data = await getJson<{ results: Raw[] }>(
			`https://itunes.apple.com/search?media=music&entity=song&country=US&limit=${limit}&term=${encodeURIComponent(q)}`
		);
		return tracksFrom(data.results);
	});
}

export function getAlbum(id: number) {
	return cached(`a:${id}`, async () => {
		const data = await getJson<{ results: (Raw & { copyright?: string; trackCount?: number })[] }>(
			`https://itunes.apple.com/lookup?id=${id}&entity=song&country=US`
		);
		const info = data.results.find((r) => r.wrapperType === 'collection');
		if (!info) return null;
		const tracks = data.results.map(toTrack).filter((t): t is Track => !!t);
		return {
			id,
			title: info.collectionName ?? '',
			artist: info.artistName ?? '',
			art: bigArt(info.artworkUrl100),
			year: info.releaseDate?.slice(0, 4) ?? null,
			genre: info.primaryGenreName ?? '',
			copyright: info.copyright ?? '',
			tracks
		};
	});
}

// Apple Music's "most played in the US" chart, then one lookup call to get previews
export function getChart() {
	return cached('chart', async () => {
		const feed = await getJson<{ feed: { results: { id: string }[] } }>(
			'https://rss.marketingtools.apple.com/api/v2/us/music/most-played/40/songs.json'
		);
		const ids = feed.feed.results.map((r) => r.id).join(',');
		const data = await getJson<{ results: Raw[] }>(`https://itunes.apple.com/lookup?id=${ids}&country=US`);
		const byId = new Map(tracksFrom(data.results).map((t) => [String(t.id), t]));
		const out = feed.feed.results.map((r) => byId.get(r.id)).filter((t): t is Track => !!t);
		return [...new Map(out.map((t) => [t.id, t])).values()];
	});
}

// Hand-picked crates. Each one mixes songs from a few artists, searched by
// artist name so we get the real thing and not "type beat" uploads.
export const CRATES = [
	{ slug: 'bollywood', title: 'Bollywood heartbreak', blurb: 'The voices that make a bad day worse, in the best way.', artists: ['arijit singh', 'atif aslam', 'shreya ghoshal'] },
	{ slug: 'jazz', title: 'Blue Note mornings', blurb: 'Coffee, a window and some hard bop.', artists: ['miles davis', 'john coltrane', 'art blakey'] },
	{ slug: 'nineties', title: '90s hip-hop', blurb: 'Boom bap from the golden era.', artists: ['nas', 'a tribe called quest', 'the notorious b.i.g.'] },
	{ slug: 'indie', title: 'Indie for long drives', blurb: 'Guitars, big choruses and open roads.', artists: ['arctic monkeys', 'the strokes', 'tame impala'] },
	{ slug: 'electronic', title: 'After midnight', blurb: 'Electronic music for the drive home.', artists: ['daft punk', 'odesza', 'bonobo'] },
	{ slug: 'rahman', title: 'A. R. Rahman essentials', blurb: 'The Mozart of Madras, from Roja to Rockstar.', artists: ['a r rahman'] }
];

export function artistTracks(artist: string, limit: number) {
	const q = artist.toLowerCase();
	return cached(`artist:${q}:${limit}`, async () => {
		const data = await getJson<{ results: Raw[] }>(
			`https://itunes.apple.com/search?media=music&entity=song&attribute=artistTerm&country=US&limit=${limit}&term=${encodeURIComponent(q)}`
		);
		return tracksFrom(data.results);
	});
}

// Deal songs out like cards so artists alternate; collaborations appear under
// both artists, so skip repeats
export function mix(lists: Track[][], per: number) {
	const out: Track[] = [];
	const seen = new Set<number>();
	for (let i = 0; i < per; i++)
		for (const l of lists)
			if (l[i] && !seen.has(l[i].id)) {
				seen.add(l[i].id);
				out.push(l[i]);
			}
	return out;
}

// Generated by scripts/build-crates.ts
export async function getCrates(): Promise<Crate[]> {
	return (crateData as Crate[]).filter((c) => c.tracks.length >= 6);
}
