<script lang="ts">
	import { player } from '#lib/player.svelte.ts';
	import Scrubber from './Scrubber.svelte';
	import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Disc3, Heart } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	const t = $derived(player.current);
</script>

{#if t}
	<div class="fixed inset-x-0 bottom-14 z-40 border-t border-line bg-felt/95 backdrop-blur md:bottom-0" transition:fly={{ y: 80, duration: 300 }}>
		<div class="absolute inset-x-0 -top-[9px]"><Scrubber /></div>
		<div class="mx-auto flex h-20 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
			<button class="flex min-w-0 flex-1 items-center gap-3 text-left" onclick={() => (player.turntableOpen = true)} aria-label="Open turntable">
				<span class="relative size-12 shrink-0">
					<span class="spin absolute inset-0 rounded-full bg-[#0b0b0c]" class:paused={!player.playing}>
						<img src={t.artSmall} alt="" class="absolute left-1/2 top-1/2 size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full object-cover" />
					</span>
					<img src={t.artSmall} alt="" class="absolute inset-0 size-12 rounded object-cover transition-transform duration-500" style="transform: translateX({player.playing ? -14 : 0}px)" />
				</span>
				<span class="min-w-0">
					<span class="block truncate font-semibold">{t.title}</span>
					<span class="block truncate text-sm text-sage">{player.error ?? t.artist}</span>
				</span>
			</button>

			<div class="flex items-center gap-1 sm:gap-2">
				<button class="hidden rounded-full p-2 hover:bg-felt-2 sm:block" onclick={() => player.prev()} aria-label="Previous"><SkipBack size={18} fill="currentColor" /></button>
				<button class="grid size-11 place-items-center rounded-full bg-paper text-felt transition hover:scale-105" onclick={() => player.toggle()} aria-label={player.playing ? 'Pause' : 'Play'}>
					{#if player.playing}<Pause size={20} fill="currentColor" />{:else}<Play size={20} fill="currentColor" class="ml-0.5" />{/if}
				</button>
				<button class="rounded-full p-2 hover:bg-felt-2" onclick={() => player.next()} aria-label="Next"><SkipForward size={18} fill="currentColor" /></button>
			</div>

			<div class="hidden flex-1 items-center justify-end gap-2 md:flex">
				<button
					class="rounded-full p-2 text-sage hover:text-paper"
					class:!text-pink={player.likedIds.has(t.id)}
					onclick={() => player.toggleLike(t)}
					aria-pressed={player.likedIds.has(t.id)}
					aria-label="Like"
				>
					<Heart size={18} fill={player.likedIds.has(t.id) ? 'currentColor' : 'none'} />
				</button>
				<button class="rounded-full p-2 text-sage hover:text-paper" onclick={() => player.setVolume(player.volume ? 0 : 0.8)} aria-label={player.volume ? 'Mute' : 'Unmute'}>
					{#if player.volume}<Volume2 size={18} />{:else}<VolumeX size={18} />{/if}
				</button>
				<input type="range" min="0" max="1" step="0.01" value={player.volume} oninput={(e) => player.setVolume(+e.currentTarget.value)} class="w-24 accent-pink" aria-label="Volume" />
				<button class="ml-2 flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:border-paper" onclick={() => (player.turntableOpen = true)}>
					<Disc3 size={16} /> Turntable
				</button>
			</div>
		</div>
	</div>
{/if}
