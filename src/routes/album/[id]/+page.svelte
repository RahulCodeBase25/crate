<script lang="ts">
	import type { PageProps } from './$types';
	import TrackList from '#lib/components/TrackList.svelte';
	import { player } from '#lib/player.svelte.ts';
	import { Play } from '@lucide/svelte';
	let { data }: PageProps = $props();
	const a = $derived(data.album);
</script>

<svelte:head><title>{a.title} · Crate</title></svelte:head>

<div class="px-5 pt-10 sm:px-8">
	<div class="flex flex-col gap-8 sm:flex-row sm:items-end">
		<img src={a.art} alt="{a.title} cover" class="w-56 rounded-md shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] sm:w-64" />
		<div>
			<p class="text-sm text-sage">{[a.genre, a.year].filter(Boolean).join(', ')}</p>
			<h1 class="mt-2 font-display text-[clamp(2rem,5vw,3.8rem)] font-extrabold leading-[0.95] tracking-tight">{a.title}</h1>
			<p class="mt-2 text-lg">{a.artist}</p>
			{#if a.tracks.length}
				<button onclick={() => player.play(a.tracks[0], a.tracks)} class="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 font-semibold text-felt">
					<Play size={16} fill="currentColor" /> Play album
				</button>
			{/if}
		</div>
	</div>
	<div class="mt-10"><TrackList tracks={a.tracks} showAlbum={false} /></div>
	{#if a.copyright}<p class="mt-6 text-xs text-sage">{a.copyright}</p>{/if}
</div>
