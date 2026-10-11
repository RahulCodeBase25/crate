<script lang="ts">
	import { player, fmt } from '#lib/player.svelte.ts';
	import Visualizer from './Visualizer.svelte';
	import Scrubber from './Scrubber.svelte';
	import { Play, Pause, SkipBack, SkipForward, X, Heart } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';

	const t = $derived(player.current);
	const upNext = $derived(player.queue.slice(player.index + 1, player.index + 8));

	let w = $state(1200);
	const deck = $derived(Math.min(560, w - 40));
</script>

<svelte:window bind:innerWidth={w} onkeydown={(e) => e.key === 'Escape' && (player.turntableOpen = false)} />

{#if t}
	<div
		class="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(120%_80%_at_30%_40%,#1f4536_0%,#0e2019_70%)]"
		role="dialog"
		aria-modal="true"
		aria-label="Turntable: {t.title}"
		transition:fade={{ duration: 200 }}
	>
		<button class="absolute right-5 top-5 z-10 rounded-full bg-felt-2 p-2.5 hover:bg-felt-3" onclick={() => (player.turntableOpen = false)} aria-label="Close turntable">
			<X size={20} />
		</button>

		<div class="mx-auto grid min-h-full max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-[auto_1fr] lg:gap-16">
			<!-- the deck -->
			<div class="relative mx-auto grid place-items-center" style="width: {deck}px; height: {deck}px">
				<div class="absolute inset-0 grid place-items-center">
					<Visualizer size={deck} inner={0.66} />
				</div>
				<div
					class="spin relative grid place-items-center rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]"
					class:paused={!player.playing}
					style="width: {deck * 0.64}px; height: {deck * 0.64}px; background: repeating-radial-gradient(circle at center, #0b0b0c 0 2px, #161618 2px 4px);"
				>
					<!-- light reflection on the vinyl stays still while the record turns -->
					<img src={t.art} alt="" class="size-[38%] rounded-full object-cover ring-4 ring-black/60" />
					<span class="absolute size-3 rounded-full bg-[#0b0b0c] ring-2 ring-white/20"></span>
				</div>
				<div class="pointer-events-none absolute rounded-full bg-[conic-gradient(from_200deg,transparent_0deg,rgba(255,255,255,.08)_40deg,transparent_80deg,transparent_200deg,rgba(255,255,255,.05)_240deg,transparent_280deg)]" style="width: {deck * 0.64}px; height: {deck * 0.64}px"></div>
				<!-- tonearm swings onto the record when playing -->
				<svg
					class="absolute origin-[86%_10%] transition-transform duration-700 ease-out"
					style="right: 0; top: 0; width: {deck * 0.42}px; transform: rotate({player.playing ? 22 : 0}deg)"
					viewBox="0 0 200 260"
					aria-hidden="true"
				>
					<circle cx="172" cy="26" r="20" fill="#2c5442" />
					<circle cx="172" cy="26" r="8" fill="#a4b8ab" />
					<path d="M172 26 L150 190 L118 232" stroke="#d9d4c7" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" />
					<rect x="98" y="222" width="34" height="22" rx="4" transform="rotate(-38 115 233)" fill="#f3efe4" />
				</svg>
			</div>

			<!-- now playing -->
			<div in:fly={{ y: 20, duration: 400, delay: 100 }}>
				<p class="text-sm font-semibold text-pink">{player.playing ? 'Now spinning' : 'Paused'}{player.loading ? ', loading…' : ''}</p>
				<h2 class="mt-2 font-display text-[clamp(2.2rem,5vw,4.2rem)] font-extrabold leading-[0.95] tracking-tight">{t.title}</h2>
				<p class="mt-3 text-xl text-paper/85">{t.artist}</p>
				{#if t.albumId}
					<a href="/album/{t.albumId}" onclick={() => (player.turntableOpen = false)} class="mt-1 inline-block text-sage underline-offset-4 hover:text-paper hover:underline">
						{t.album}{t.year ? ` (${t.year})` : ''}
					</a>
				{/if}

				<div class="mt-8 max-w-md">
					<Scrubber />
					<div class="mt-1 flex justify-between text-xs tabular-nums text-sage">
						<span>{fmt(player.time)}</span><span>{fmt(player.duration)}</span>
					</div>
				</div>

				<div class="mt-5 flex items-center gap-3">
					<button class="rounded-full p-3 hover:bg-felt-2" onclick={() => player.prev()} aria-label="Previous"><SkipBack size={22} fill="currentColor" /></button>
					<button class="grid size-16 place-items-center rounded-full bg-paper text-felt transition hover:scale-105" onclick={() => player.toggle()} aria-label={player.playing ? 'Pause' : 'Play'}>
						{#if player.playing}<Pause size={26} fill="currentColor" />{:else}<Play size={26} fill="currentColor" class="ml-1" />{/if}
					</button>
					<button class="rounded-full p-3 hover:bg-felt-2" onclick={() => player.next()} aria-label="Next"><SkipForward size={22} fill="currentColor" /></button>
					<button
						class="ml-2 rounded-full p-3 hover:bg-felt-2"
						class:text-pink={player.likedIds.has(t.id)}
						onclick={() => player.toggleLike(t)}
						aria-pressed={player.likedIds.has(t.id)}
						aria-label="Like"
					>
						<Heart size={22} fill={player.likedIds.has(t.id) ? 'currentColor' : 'none'} />
					</button>
				</div>

				{#if upNext.length}
					<h3 class="mt-10 font-display text-lg font-bold">Up next</h3>
					<ul class="mt-3 space-y-1">
						{#each upNext as n (n.id)}
							<li>
								<button class="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-felt-2" onclick={() => player.play(n, player.queue)}>
									<img src={n.artSmall} alt="" class="size-10 rounded object-cover" />
									<span class="min-w-0">
										<span class="block truncate text-sm font-semibold">{n.title}</span>
										<span class="block truncate text-xs text-sage">{n.artist}</span>
									</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				<p class="mt-8 text-xs text-sage">Previews are 30 seconds, courtesy of Apple. Space to play or pause, ← → to seek, Esc to close.</p>
			</div>
		</div>
	</div>
{/if}
