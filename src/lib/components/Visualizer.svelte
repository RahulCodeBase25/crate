<script lang="ts">
	import { player } from '#lib/player.svelte.ts';

	// Draws the live frequency spectrum of the song as bars around a circle.
	// Data comes from the Web Audio AnalyserNode in the player.
	let { size = 520, inner = 0.62 }: { size?: number; inner?: number } = $props();
	let canvas: HTMLCanvasElement;

	$effect(() => {
		const ctx = canvas.getContext('2d')!;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = size * dpr;
		canvas.height = size * dpr;
		ctx.scale(dpr, dpr);

		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const bins = new Uint8Array(128);
		const BARS = 96;
		const c = size / 2;
		const r0 = c * inner;
		let raf = 0;
		let smooth = new Float32Array(BARS);

		const draw = () => {
			ctx.clearRect(0, 0, size, size);
			const a = player.analyser;
			if (a && player.playing) a.getByteFrequencyData(bins);
			else bins.fill(0);

			for (let i = 0; i < BARS; i++) {
				// mirror the spectrum so the ring is symmetric, and favour the musical low-mid range
				const k = i < BARS / 2 ? i : BARS - 1 - i;
				const v = bins[Math.floor((k / (BARS / 2)) * 70)] / 255;
				smooth[i] = smooth[i] * 0.7 + v * 0.3;
				const len = 4 + smooth[i] * c * 0.34;
				const ang = (i / BARS) * Math.PI * 2 - Math.PI / 2;
				const x1 = c + Math.cos(ang) * r0;
				const y1 = c + Math.sin(ang) * r0;
				const x2 = c + Math.cos(ang) * (r0 + len);
				const y2 = c + Math.sin(ang) * (r0 + len);
				ctx.strokeStyle = `rgba(255, 111, 174, ${0.25 + smooth[i] * 0.75})`;
				ctx.lineWidth = Math.max(2, (Math.PI * 2 * r0) / BARS - 3);
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
			}
			if (!reduce) raf = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(raf);
	});
</script>

<canvas bind:this={canvas} style="width: {size}px; height: {size}px" class="pointer-events-none max-w-full" aria-hidden="true"></canvas>
