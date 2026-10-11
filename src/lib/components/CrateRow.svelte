<script lang="ts">
	import type { Crate } from '#lib/types.ts';
	import { player } from '#lib/player.svelte.ts';
	import Sleeve from './Sleeve.svelte';
	import { Shuffle } from '@lucide/svelte';

	let { crate }: { crate: Crate } = $props();

	function shuffle() {
		const list = [...crate.tracks].sort(() => Math.random() - 0.5);
		player.play(list[0], list);
	}
</script>

<section class="mt-12" aria-labelledby="crate-{crate.slug}">
	<div class="flex items-end justify-between gap-4 px-5 sm:px-8">
		<div>
			<h2 id="crate-{crate.slug}" class="font-display text-2xl font-bold tracking-tight">{crate.title}</h2>
			<p class="mt-1 text-sm text-sage">{crate.blurb}</p>
		</div>
		<button onclick={shuffle} class="flex shrink-0 items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-paper">
			<Shuffle size={15} /> Shuffle
		</button>
	</div>
	<div class="rail mt-5 flex snap-x scroll-px-5 gap-5 overflow-x-auto px-5 pb-3 sm:scroll-px-8 sm:px-8" role="region" aria-label={crate.title}>
		{#each crate.tracks as t (t.id)}
			<Sleeve track={t} queue={crate.tracks} />
		{/each}
	</div>
</section>
