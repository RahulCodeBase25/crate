import type { Config } from '@sveltejs/adapter-vercel';
import type { PageServerLoad } from './$types';

// Incremental Static Regeneration on Vercel: the page is cached and rebuilt in the background
export const config: Config = { isr: { expiration: 3600 } };
import { getChart } from '#lib/server/itunes.ts';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({ 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' });
	return { chart: await getChart() };
};
