import type { Track } from '#lib/types.ts';

// One audio player for the whole app, written with Svelte 5 runes.
// Any component can read player.current, player.playing, etc. and the UI
// updates on its own.

const LIKES_KEY = 'crate-liked';

function loadLikes(): Track[] {
	try {
		return JSON.parse(localStorage.getItem(LIKES_KEY) ?? '[]');
	} catch {
		return [];
	}
}

class Player {
	queue = $state<Track[]>([]);
	index = $state(-1);
	playing = $state(false);
	loading = $state(false);
	time = $state(0);
	duration = $state(30);
	volume = $state(0.8);
	turntableOpen = $state(false);
	liked = $state<Track[]>([]);
	error = $state<string | null>(null);

	current = $derived(this.index >= 0 ? (this.queue[this.index] ?? null) : null);
	progress = $derived(this.duration ? this.time / this.duration : 0);
	likedIds = $derived(new Set(this.liked.map((t) => t.id)));

	audio: HTMLAudioElement | null = null;
	analyser: AnalyserNode | null = null;
	private ctx: AudioContext | null = null;

	/** Called once in the browser by the root layout */
	attach(el: HTMLAudioElement) {
		this.audio = el;
		el.volume = this.volume;
		el.crossOrigin = 'anonymous'; // Apple sends CORS headers, so the visualizer can read the audio
		el.addEventListener('timeupdate', () => (this.time = el.currentTime));
		el.addEventListener('loadedmetadata', () => (this.duration = el.duration || 30));
		el.addEventListener('playing', () => ((this.playing = true), (this.loading = false)));
		el.addEventListener('pause', () => (this.playing = false));
		el.addEventListener('waiting', () => (this.loading = true));
		el.addEventListener('ended', () => this.next());
		el.addEventListener('error', () => {
			this.loading = false;
			this.error = "This preview couldn't load. Skipping.";
			setTimeout(() => this.next(), 1200);
		});
		this.liked = loadLikes();
	}

	// The AudioContext must be created after a click, so it happens on first play
	private ensureGraph() {
		if (this.ctx || !this.audio) return;
		const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		this.ctx = new Ctx();
		const source = this.ctx.createMediaElementSource(this.audio);
		this.analyser = this.ctx.createAnalyser();
		this.analyser.fftSize = 256;
		this.analyser.smoothingTimeConstant = 0.8;
		source.connect(this.analyser);
		this.analyser.connect(this.ctx.destination);
	}

	play(track: Track, queue: Track[] = [track]) {
		if (!this.audio) return;
		this.ensureGraph();
		this.ctx?.resume();
		const i = queue.findIndex((t) => t.id === track.id);
		this.queue = queue;
		this.index = i >= 0 ? i : 0;
		this.load();
	}

	private load() {
		const t = this.current;
		if (!t || !this.audio) return;
		this.error = null;
		this.loading = true;
		this.time = 0;
		this.audio.src = t.preview;
		this.audio.play().catch(() => (this.loading = false));
		this.updateMediaSession(t);
	}

	toggle() {
		if (!this.audio || !this.current) return;
		this.ensureGraph();
		this.ctx?.resume();
		if (this.audio.paused) this.audio.play();
		else this.audio.pause();
	}

	next() {
		if (this.index < this.queue.length - 1) {
			this.index += 1;
			this.load();
		} else {
			this.audio?.pause();
		}
	}

	prev() {
		if (this.audio && this.audio.currentTime > 3) {
			this.audio.currentTime = 0;
			return;
		}
		if (this.index > 0) {
			this.index -= 1;
			this.load();
		}
	}

	seek(fraction: number) {
		if (!this.audio) return;
		this.audio.currentTime = Math.max(0, Math.min(1, fraction)) * this.duration;
	}

	setVolume(v: number) {
		this.volume = Math.max(0, Math.min(1, v));
		if (this.audio) this.audio.volume = this.volume;
	}

	addToQueue(track: Track) {
		if (!this.current) return this.play(track);
		this.queue = [...this.queue.slice(0, this.index + 1), track, ...this.queue.slice(this.index + 1).filter((t) => t.id !== track.id)];
	}

	toggleLike(track: Track) {
		this.liked = this.likedIds.has(track.id) ? this.liked.filter((t) => t.id !== track.id) : [track, ...this.liked];
		try {
			localStorage.setItem(LIKES_KEY, JSON.stringify(this.liked));
		} catch {
			/* private mode: likes last for this visit only */
		}
	}

	// Lock-screen / headphone controls
	private updateMediaSession(t: Track) {
		if (!('mediaSession' in navigator)) return;
		navigator.mediaSession.metadata = new MediaMetadata({
			title: t.title,
			artist: t.artist,
			album: t.album,
			artwork: [{ src: t.art, sizes: '600x600', type: 'image/jpeg' }]
		});
		navigator.mediaSession.setActionHandler('play', () => this.toggle());
		navigator.mediaSession.setActionHandler('pause', () => this.toggle());
		navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
		navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
	}
}

export const player = new Player();

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
