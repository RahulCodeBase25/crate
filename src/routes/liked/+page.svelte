<script lang="ts">
	import { player } from '#lib/player.svelte.ts';
	import TrackList from '#lib/components/TrackList.svelte';
	import { Play } from '@lucide/svelte';
</script>

<svelte:head><title>Liked · Crate</title></svelte:head>

<div class="px-5 pt-10 sm:px-8">
	<h1 class="font-display text-[clamp(2.4rem,6vw,4.4rem)] font-extrabold leading-none tracking-tight">Liked songs</h1>
	<p class="mt-3 text-sage">Saved in this browser.</p>
	{#if player.liked.length}
		<button onclick={() => player.play(player.liked[0], player.liked)} class="mt-6 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-2.5 font-semibold text-felt">
			<Play size={16} fill="currentColor" /> Play all {player.liked.length}
		</button>
		<div class="mt-8"><TrackList tracks={player.liked} numbered={false} /></div>
	{:else}
		<p class="mt-8 max-w-md text-sage">Nothing here yet. Tap the heart on any song and it lands in this crate.</p>
		<a href="/" class="mt-5 inline-block rounded-full border border-line px-5 py-2.5 font-semibold hover:border-paper">Start digging</a>
	{/if}
</div>
