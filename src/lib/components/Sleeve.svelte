<script lang="ts">
	import type { Track } from '#lib/types.ts';
	import { player } from '#lib/player.svelte.ts';
	import Bars from './Bars.svelte';
	import { Play, Pause } from '@lucide/svelte';

	let { track, queue }: { track: Track; queue: Track[] } = $props();
	const isCurrent = $derived(player.current?.id === track.id);
</script>

<div class="group w-40 shrink-0 snap-start sm:w-44">
	<button
		class="relative block aspect-square w-full overflow-hidden rounded-md bg-felt-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,.6)] transition group-hover:-translate-y-1"
		onclick={() => (isCurrent ? player.toggle() : player.play(track, queue))}
		aria-label={isCurrent && player.playing ? `Pause ${track.title}` : `Play ${track.title} by ${track.artist}`}
	>
		<img src={track.art} alt="" loading="lazy" class="size-full object-cover" />
		<!-- the record peeks out of the sleeve on hover, or while it plays -->
		<span
			class="absolute inset-0 grid place-items-center bg-felt/40 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
			class:!opacity-100={isCurrent}
		>
			<span class="grid size-12 place-items-center rounded-full bg-paper text-felt shadow-lg">
				{#if isCurrent && player.playing}<Pause size={20} fill="currentColor" />{:else}<Play size={20} fill="currentColor" class="ml-0.5" />{/if}
			</span>
		</span>
	</button>
	<div class="mt-2.5 flex items-start gap-2">
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-semibold" class:text-pink={isCurrent}>{track.title}</p>
			<p class="truncate text-xs text-sage">{track.artist}</p>
		</div>
		{#if isCurrent}<span class="pt-1"><Bars active={player.playing} /></span>{/if}
	</div>
</div>
