<script lang="ts">
	import { page } from '$app/state';

	import '@fontsource-variable/merriweather-sans';
	import '../app.css';
	import calendarIcon from '$lib/icons/Calendar.svg?raw';
	import logoIcon from '$lib/icons/Logo.svg?raw';
	import gitIcon from '$lib/icons/Git.svg?raw';

	import dayjs from 'dayjs';

	import utc from 'dayjs/plugin/utc';
	dayjs.extend(utc);

	import timezone from 'dayjs/plugin/timezone';
	dayjs.extend(timezone);

	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);

	import duration from 'dayjs/plugin/duration';
	dayjs.extend(duration);

	import 'dayjs/locale/it';
	dayjs.tz.setDefault('Europe/Rome');
	dayjs.locale('it');
</script>

<svelte:head>
	<title>AlmaAule</title>
</svelte:head>

<div class="bg-base-200 min-h-screen transition-colors">
	<div class="mx-auto max-w-6xl px-2 sm:px-4 md:px-8 pt-2">
		<nav
			class="navbar flex flex-row items-center justify-between rounded-xl border-b border-base-300 shadow-lg bg-primary/90 text-primary-content px-2 sm:px-4 py-0 mb-8 backdrop-blur-md transition-all"
			aria-label="main navigation"
		>
			<a href="/" class="flex items-center gap-2 group transition-all hover:opacity-90 min-w-0">
				<span
					class="bg-base-100 rounded-full w-9 h-9 flex items-center justify-center border-2 border-primary shadow group-hover:scale-105 transition-transform text-primary"
				>
					{@html logoIcon}
				</span>
				<span
					class="font-bold text-lg sm:text-xl tracking-wide group-hover:underline transition-all"
				>
					AlmaAule
				</span>
			</a>
			<div class="flex flex-row items-center gap-1 sm:gap-2">
				<a
					href="/aule"
					class="btn btn-secondary rounded-full font-semibold flex items-center justify-center gap-2 shadow-md transition-all px-3 sm:px-5 py-2 text-base sm:text-lg"
					class:btn-active={page.url.pathname === '/aule'}
					aria-label="Classrooms"
				>
					<span class="w-5 h-5 sm:w-6 sm:h-6 text-inherit flex items-center justify-center"
						>{@html calendarIcon}</span
					>
					<span class="hidden sm:inline">Classrooms</span>
				</a>
			</div>
		</nav>
		<main
			class="bg-base-100 rounded-xl shadow p-3 sm:p-6 md:p-10 mt-2 sm:mt-4 mb-8 transition-colors"
		>
			<slot />
		</main>
		<footer
			class="mt-4 mb-2 rounded-xl bg-primary text-primary-content shadow flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 text-sm"
		>
			<div class="flex items-center gap-2">
				<span class="font-bold tracking-wide text-lg">AlmaAule</span>
				<span class="hidden sm:inline border-l border-primary-content h-5 mx-2"></span>
				<span class="italic">Made with ❤️ by the CS community</span>
			</div>
			<div class="flex items-center gap-3">
				<a
					href="https://github.com/VaiTon/uniboaule"
					target="_blank"
					rel="noopener"
					class="link link-hover text-primary-content underline-offset-2 flex items-center gap-1"
				>
					<span class="w-5 h-5 sm:w-6 sm:h-6 text-primary-content flex items-center justify-center"
						>{@html gitIcon}</span
					>
					<span class="hidden sm:inline">Git</span>
				</a>
				<span class="opacity-80">&copy; {new Date().getFullYear()} Eyad Issa</span>
			</div>
		</footer>
	</div>
</div>
