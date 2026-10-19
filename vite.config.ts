import adapterNode from '@sveltejs/adapter-node';
import adapterVercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

const adapter = process.env.VERCEL ? adapterVercel() : adapterNode();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter,
			preprocess: vitePreprocess()
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
