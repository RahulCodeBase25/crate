<script lang="ts">
	import type { PageProps } from './$types';
	import { player } from '#lib/player.svelte.ts';
	import CrateRow from '#lib/components/CrateRow.svelte';
	import Sleeve from '#lib/components/Sleeve.svelte';
	import { Play } from '@lucide/svelte';

	let { data }: PageProps = $props();
	// the US #1 if the chart loaded, otherwise the first record in the first crate
	const first = $derived(data.top[0] ?? data.crates[0]?.tracks[0]);
	const firstQueue = $derived(data.top.length ? data.top : (data.crates[0]?.tracks ?? []));
	const firstLabel = $derived(data.top.length ? 'Spin the US #1' : 'Spin');
</script>

<svelte:head>
	<title>Crate: dig for music</title>
	<meta name="description" content="Dig through crates of music, play 30-second previews on a spinning turntable with a live audio visualizer. Built with SvelteKit 3 and Svelte 5." />
</svelte:head>

<section class="relative overflow-hidden px-5 pt-10 sm:px-8 sm:pt-14">
	<div class="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
		<div>
			<h1 class="font-display text-[clamp(2.6rem,4.6vw,4.4rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">
				Dig through<br />the crates.
			</h1>
			<p class="mt-6 max-w-md text-lg text-sage">
				Pull any record, drop the needle, and watch the sound move. Every song plays a 30-second preview on a turntable that listens back.
			</p>
			{#if first}
				<button
					onclick={() => {
						player.play(first, firstQueue);
						player.turntableOpen = true;
					}}
					class="mt-8 inline-flex items-center gap-3 rounded-full bg-paper py-3 pl-3 pr-6 font-semibold text-felt transition hover:scale-[1.02]"
				>
					<span class="grid size-9 place-items-center rounded-full bg-felt text-paper"><Play size={16} fill="currentColor" class="ml-0.5" /></span>
					{firstLabel}: {first.title}
				</button>
			{/if}
		</div>
		<!-- the #1 record sliding out of its sleeve -->
		{#if first}
			<div class="relative mx-auto aspect-square w-full max-w-[420px]" aria-hidden="true">
				<div class="spin absolute right-0 top-[11%] aspect-square w-[78%] rounded-full shadow-2xl" style="background: repeating-radial-gradient(circle, #0b0b0c 0 2px, #17171a 2px 4px);">
					<img src={first.art} alt="" class="absolute left-1/2 top-1/2 size-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover" />
				</div>
				<img src={first.art} alt="" class="absolute left-0 top-[11%] aspect-square w-[78%] rounded-md object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)]" />
			</div>
		{/if}
	</div>
</section>

{#if data.top.length}
	<section class="mt-14" aria-labelledby="top">
		<div class="flex items-end justify-between px-5 sm:px-8">
			<h2 id="top" class="font-display text-2xl font-bold tracking-tight">Most played in the US today</h2>
			<a href="/chart" class="text-sm font-semibold text-sage hover:text-paper">Full chart</a>
		</div>
		<div class="rail mt-5 flex snap-x scroll-px-5 gap-5 overflow-x-auto px-5 pb-3 sm:scroll-px-8 sm:px-8" role="region" aria-label="Top songs">
			{#each data.top as t (t.id)}<Sleeve track={t} queue={data.top} />{/each}
		</div>
	</section>
{/if}

{#each data.crates as crate (crate.slug)}
	<CrateRow {crate} />
{/each}
