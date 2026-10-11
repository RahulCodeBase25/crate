export type Track = {
	id: number;
	title: string;
	artist: string;
	artistId: number | null;
	album: string;
	albumId: number | null;
	art: string; // 600×600 cover
	artSmall: string; // 100×100 cover
	preview: string; // 30-second AAC preview from Apple
	durationMs: number;
	genre: string;
	year: string | null;
};

export type Crate = { slug: string; title: string; blurb: string; tracks: Track[] };
