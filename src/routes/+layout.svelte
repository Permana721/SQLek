<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>SQL Interactive Playground</title>
</svelte:head>

<div class="min-h-screen bg-black text-zinc-100 flex flex-col antialiased">
	{@render children()}
</div>
