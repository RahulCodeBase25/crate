<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="grid min-h-[60vh] place-items-center px-5 text-center">
	<div>
		<p class="font-display text-7xl font-extrabold text-pink">{page.status}</p>
		<p class="mt-3 text-sage">{page.status === 404 ? "This record isn't in any crate." : 'Something skipped. Try again.'}</p>
		<a href="/" class="mt-6 inline-block rounded-full bg-paper px-5 py-2.5 font-semibold text-felt">Back to digging</a>
	</div>
</div>
