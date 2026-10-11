<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { search } from '#lib/music.remote.ts';
	import TrackList from '#lib/components/TrackList.svelte';
	import type { Track } from '#lib/types.ts';
	import { Search } from '@lucide/svelte';

	let q = $state(page.url.searchParams.get('q') ?? '');
	let results = $state<Track[] | null>(null);
	let busy = $state(false);
	let failed = $state(false);
	let latest = '';

	const suggestions = ['A. R. Rahman', 'Taylor Swift', 'Lata Mangeshkar', 'Daft Punk', 'Miles Davis', 'Diljit Dosanjh'];

	// Debounced: wait for a pause in typing, then call the remote function
	$effect(() => {
		const term = q.trim();
		latest = term;
		if (term.length < 2) {
			results = null;
			return;
		}
		busy = true;
		const t = setTimeout(async () => {
			try {
				const r = await search(term);
				if (latest === term) ((results = r), (failed = false));
			} catch {
				if (latest === term) failed = true;
			} finally {
				if (latest === term) busy = false;
			}
			replaceState(`?q=${encodeURIComponent(term)}`, {});
		}, 250);
		return () => clearTimeout(t);
	});
</script>

<svelte:head><title>{q ? `${q} · ` : ''}Search · Crate</title></svelte:head>

<div class="px-5 pt-10 sm:px-8">
	<label class="relative block max-w-2xl">
		<span class="sr-only">Search songs and artists</span>
		<Search class="absolute left-5 top-1/2 -translate-y-1/2 text-sage" size={22} />
		<!-- svelte-ignore a11y_autofocus -->
		<input
			bind:value={q}
			autofocus
			placeholder="Artists, songs, albums"
			class="h-16 w-full rounded-full border border-line bg-felt-2 pl-14 pr-6 font-display text-xl font-semibold placeholder:text-sage/70 focus:border-paper focus:outline-none"
		/>
	</label>

	{#if !q.trim()}
		<p class="mt-8 text-sm text-sage">Try one of these:</p>
		<div class="mt-3 flex flex-wrap gap-2">
			{#each suggestions as s}
				<button class="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-paper" onclick={() => (q = s)}>{s}</button>
			{/each}
		</div>
	{:else if failed}
		<p class="mt-8 text-sage">Search isn't responding. Try again in a moment.</p>
	{:else if results && results.length === 0 && !busy}
		<p class="mt-8 text-sage">Nothing found for “{q.trim()}”. Check the spelling or try the artist's name.</p>
	{:else if results}
		<div class="mt-8 transition-opacity" class:opacity-60={busy}><TrackList tracks={results} numbered={false} /></div>
	{:else}
		<p class="mt-8 text-sage">Searching…</p>
	{/if}
</div>
