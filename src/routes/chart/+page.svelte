<script lang="ts">
	import type { PageProps } from './$types';
	import TrackList from '#lib/components/TrackList.svelte';
	import { player } from '#lib/player.svelte.ts';
	import { Play } from '@lucide/svelte';
	let { data }: PageProps = $props();
</script>

<svelte:head><title>US chart · Crate</title></svelte:head>

<div class="px-5 pt-10 sm:px-8">
	<h1 class="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-extrabold leading-none tracking-tight">Most played in the US</h1>
	<p class="mt-3 text-sage">Apple Music's live chart, refreshed every hour.</p>
	{#if data.chart.length}
		<button onclick={() => player.play(data.chart[0], data.chart)} class="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 font-semibold text-felt">
			<Play size={16} fill="currentColor" /> Play the chart
		</button>
		<div class="mt-8"><TrackList tracks={data.chart} /></div>
	{:else}
		<p class="mt-8 text-sage">The chart couldn't load. Refresh to try again.</p>
	{/if}
</div>
