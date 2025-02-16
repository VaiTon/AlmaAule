import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	plugins: [daisyui, typography],

	daisyui: {
		themes: ['cupcake', 'dark']
	}
};
