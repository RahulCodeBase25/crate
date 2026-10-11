import { error } from '@sveltejs/kit';
import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';

// Incremental Static Regeneration on Vercel: the page is cached and rebuilt in the background
export const config: Config = { isr: { expiration: 86400 } };
import { getAlbum } from '#lib/server/itunes.ts';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'No album with that id');
	const album = await getAlbum(id).catch(() => null);
	if (!album) error(404, 'No album with that id');
	setHeaders({ 'cache-control': 'public, s-maxage=86400' });
	return { album };
};
