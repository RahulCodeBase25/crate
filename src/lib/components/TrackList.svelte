<script lang="ts">
	import type { Track } from '#lib/types.ts';
	import { player, fmt } from '#lib/player.svelte.ts';
	import Bars from './Bars.svelte';
	import { Heart, ListPlus } from '@lucide/svelte';

	let { tracks, numbered = true, showAlbum = true }: { tracks: Track[]; numbered?: boolean; showAlbum?: boolean } = $props();
</script>

<ol class="divide-y divide-line">
	{#each tracks as t, i (t.id)}
		{@const isCurrent = player.current?.id === t.id}
		<li class="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 py-2 sm:grid-cols-[2rem_1fr_1fr_auto]">
			<span class="text-right text-sm tabular-nums text-sage">
				{#if isCurrent}<Bars active={player.playing} />{:else if numbered}{i + 1}{/if}
			</span>
			<button class="flex min-w-0 items-center gap-3 text-left" onclick={() => (isCurrent ? player.toggle() : player.play(t, tracks))}>
				<img src={t.artSmall} alt="" class="size-11 shrink-0 rounded object-cover" loading="lazy" />
				<span class="min-w-0">
					<span class="block truncate font-semibold" class:text-pink={isCurrent}>{t.title}</span>
					<span class="block truncate text-sm text-sage">{t.artist}</span>
				</span>
			</button>
			{#if showAlbum}
				<a href={t.albumId ? `/album/${t.albumId}` : undefined} class="hidden truncate text-sm text-sage hover:text-paper sm:block">{t.album}</a>
			{/if}
			<span class="flex items-center gap-1">
				<button
					class="rounded-full p-2 text-sage hover:text-paper"
					class:!text-pink={player.likedIds.has(t.id)}
					onclick={() => player.toggleLike(t)}
					aria-label={player.likedIds.has(t.id) ? `Unlike ${t.title}` : `Like ${t.title}`}
					aria-pressed={player.likedIds.has(t.id)}
				>
					<Heart size={17} fill={player.likedIds.has(t.id) ? 'currentColor' : 'none'} />
				</button>
				<button class="hidden rounded-full p-2 text-sage hover:text-paper sm:block" onclick={() => player.addToQueue(t)} aria-label="Play {t.title} next">
					<ListPlus size={18} />
				</button>
				<span class="w-10 text-right text-sm tabular-nums text-sage">{fmt(t.durationMs / 1000)}</span>
			</span>
		</li>
	{/each}
</ol>
