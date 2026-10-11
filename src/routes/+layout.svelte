<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { page } from '$app/state';
	import { player } from '#lib/player.svelte.ts';
	import Dock from '#lib/components/Dock.svelte';
	import Turntable from '#lib/components/Turntable.svelte';
	import { Disc3, Search, Heart, TrendingUp } from '@lucide/svelte';

	let { children }: LayoutProps = $props();
	let audio: HTMLAudioElement;

	$effect(() => player.attach(audio));

	const nav = [
		{ href: '/', label: 'Dig', icon: Disc3 },
		{ href: '/chart', label: 'Chart', icon: TrendingUp },
		{ href: '/search', label: 'Search', icon: Search },
		{ href: '/liked', label: 'Liked', icon: Heart }
	];

	// Keyboard: space play/pause, arrows seek, N/P next/previous, T turntable
	function onKey(e: KeyboardEvent) {
		const el = e.target as HTMLElement;
		if (el.closest('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey) return;
		if (!player.current) return;
		if (e.code === 'Space') (e.preventDefault(), player.toggle());
		else if (e.key === 'ArrowRight') player.seek((player.time + 5) / player.duration);
		else if (e.key === 'ArrowLeft') player.seek((player.time - 5) / player.duration);
		else if (e.key.toLowerCase() === 'n') player.next();
		else if (e.key.toLowerCase() === 'p') player.prev();
		else if (e.key.toLowerCase() === 't') player.turntableOpen = !player.turntableOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<svelte:window onkeydown={onKey} />

<audio bind:this={audio} preload="auto"></audio>

<div class="md:grid md:grid-cols-[220px_1fr]">
	<aside class="sticky top-0 hidden h-dvh flex-col border-r border-line px-5 py-7 md:flex">
		<a href="/" class="flex items-center gap-2.5 font-display text-2xl font-extrabold tracking-tight">
			<span class="grid size-8 place-items-center rounded-full bg-[#0b0b0c] ring-1 ring-line"><span class="size-3 rounded-full bg-pink"></span></span>
			Crate
		</a>
		<nav class="mt-10 flex flex-col gap-1" aria-label="Main">
			{#each nav as n}
				{@const active = n.href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(n.href)}
				<a href={n.href} class="flex items-center gap-3 rounded-lg px-3 py-2.5 font-semibold transition {active ? 'bg-felt-2 text-paper' : 'text-sage hover:text-paper'}" aria-current={active ? 'page' : undefined}>
					<n.icon size={18} />
					{n.label}
				</a>
			{/each}
		</nav>
		<p class="mt-auto text-xs leading-relaxed text-sage">
			Built with SvelteKit 3 and Svelte 5 by <a class="underline underline-offset-2 hover:text-paper" href="https://rahul-dev-portfolio.vercel.app" target="_blank" rel="noreferrer">Rahul Singh</a>.
			Music data and previews from Apple.
			<a class="mt-2 block underline underline-offset-2 hover:text-paper" href="https://github.com/RahulCodeBase25/crate" target="_blank" rel="noreferrer">Source on GitHub</a>
		</p>
	</aside>

	<main class="min-w-0 pb-40 md:pb-28">
		{@render children()}
	</main>
</div>

<!-- phone navigation -->
<nav class="fixed inset-x-0 bottom-0 z-40 grid h-14 grid-cols-4 border-t border-line bg-felt md:hidden" aria-label="Main">
	{#each nav as n}
		{@const active = n.href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(n.href)}
		<a href={n.href} class="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold {active ? 'text-paper' : 'text-sage'}" aria-current={active ? 'page' : undefined}>
			<n.icon size={18} />{n.label}
		</a>
	{/each}
</nav>

<Dock />
{#if player.turntableOpen}<Turntable />{/if}
