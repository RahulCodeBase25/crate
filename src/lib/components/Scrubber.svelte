<script lang="ts">
	import { player, fmt } from '#lib/player.svelte.ts';
</script>

<input
	type="range"
	min="0"
	max="1000"
	value={Math.round(player.progress * 1000)}
	oninput={(e) => player.seek(+e.currentTarget.value / 1000)}
	aria-label="Seek"
	aria-valuetext="{fmt(player.time)} of {fmt(player.duration)}"
	class="scrub w-full"
	style="--p: {player.progress * 100}%"
/>

<style>
	.scrub {
		appearance: none;
		height: 18px;
		background: transparent;
		cursor: pointer;
	}
	.scrub::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 4px;
		background: linear-gradient(to right, var(--color-pink) var(--p), rgb(164 184 171 / 0.3) var(--p));
	}
	.scrub::-moz-range-track {
		height: 4px;
		border-radius: 4px;
		background: linear-gradient(to right, var(--color-pink) var(--p), rgb(164 184 171 / 0.3) var(--p));
	}
	.scrub::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		margin-top: -5px;
		border-radius: 50%;
		background: var(--color-paper);
	}
	.scrub::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border: 0;
		border-radius: 50%;
		background: var(--color-paper);
	}
</style>
