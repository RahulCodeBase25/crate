<script lang="ts">
	// Small "now playing" equalizer; it freezes when paused
	let { active = true }: { active?: boolean } = $props();
</script>

<span class="inline-flex h-3.5 items-end gap-[2px]" aria-hidden="true">
	{#each [0, 1, 2] as i}
		<span class="bar w-[3px] rounded-sm bg-pink" class:paused={!active} style="animation-delay: {i * -0.35}s"></span>
	{/each}
</span>

<style>
	.bar {
		height: 100%;
		animation: eq 0.9s ease-in-out infinite;
		transform-origin: bottom;
	}
	.bar.paused {
		animation-play-state: paused;
	}
	@keyframes eq {
		0%,
		100% {
			transform: scaleY(0.3);
		}
		50% {
			transform: scaleY(1);
		}
	}
</style>
