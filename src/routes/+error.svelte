<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';

	const labels: Record<number, { title: string; emoji: string; hint: string }> = {
		404: {
			title: 'Page not found',
			emoji: '🔍',
			hint: "The page you're looking for doesn't exist or has been moved."
		},
		403: {
			title: 'Access denied',
			emoji: '🔒',
			hint: "You don't have permission to view this page."
		},
		401: {
			title: 'Unauthorised',
			emoji: '🪪',
			hint: 'Please log in to access this resource.'
		},
		500: {
			title: 'Server error',
			emoji: '💥',
			hint: 'Something went wrong on our end. Please try again later.'
		}
	};

	const fallback = {
		title: 'Something went wrong',
		emoji: '⚠️',
		hint: 'An unexpected error occurred. Please try again.'
	};

	let info = $derived(labels[page.status] ?? (page.status >= 500 ? labels[500] : fallback));
</script>

<svelte:head>
	<title>Error {page.status} — AlmaAule</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-10 py-8 px-4">
	<!-- Status Code with Glitch Effect -->
	<div
		class="relative flex flex-col items-center justify-center w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl min-h-64 py-12 px-8 bg-secondary"
	>
		<div
			class="status-code font-black leading-none tracking-tighter text-white select-none drop-shadow-2xl"
			aria-hidden="true"
		>
			{page.status}
		</div>
	</div>

	<div class="flex flex-col items-center text-center gap-6 max-w-md">
		<div class="relative">
			<span class="text-7xl block" role="img" aria-label={info.title}>
				{info.emoji}
			</span>
			<div
				class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-base-content/5 rounded-[100%] blur-sm"
			></div>
		</div>

		<div class="space-y-3">
			<h1 class="text-4xl sm:text-5xl font-black tracking-tight text-base-content uppercase">
				{info.title}
			</h1>
			<div class="flex justify-center items-center gap-3" aria-hidden="true">
				<div class="h-1.5 w-12 rounded-full bg-secondary/20"></div>
				<div class="h-1.5 w-1.5 rounded-full bg-secondary"></div>
				<div class="h-1.5 w-12 rounded-full bg-secondary/20"></div>
			</div>
			<p class="text-lg text-base-content/70 leading-relaxed font-medium">
				{page.error?.message ?? info.hint}
			</p>
		</div>
	</div>

	<div class="flex flex-col sm:flex-row gap-4 w-full max-w-md">
		<a
			href={resolve('/')}
			class="btn btn-primary btn-lg flex-1 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group"
		>
			<span class="group-hover:-translate-x-1 transition-transform" aria-hidden="true">←</span>
			Back to home
		</a>
		<a
			href="https://github.com/VaiTon/uniboaule/issues"
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-outline btn-lg flex-1 rounded-2xl border-2 hover:bg-base-200 hover:text-base-content transition-all"
		>
			<span class="mr-2" aria-hidden="true">🐛</span> Report issue
		</a>
	</div>
</div>

<style>
	.status-code {
		font-size: clamp(7rem, 25vw, 12rem);
		text-shadow:
			2px 2px 0px rgba(0, 0, 0, 0.1),
			-1px -1px 0px rgba(255, 255, 255, 0.1);
		animation: glitch 4s infinite linear alternate-reverse;
	}

	@keyframes glitch {
		0% {
			transform: translate(0);
			text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
		}
		2% {
			transform: translate(-2px, 2px);
			text-shadow:
				3px -3px 0 red,
				-3px 3px 0 blue;
		}
		4% {
			transform: translate(2px, -2px);
			text-shadow:
				-3px 3px 0 red,
				3px -3px 0 blue;
		}
		6% {
			transform: translate(0);
			text-shadow: 2px 2px 0px rgba(0, 0, 0, 0.1);
		}
		100% {
			transform: translate(0);
		}
	}
</style>
