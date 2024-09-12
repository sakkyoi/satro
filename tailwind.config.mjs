/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
		'./astro.config.mjs',
		'node_modules/preline/dist/*.js',
	],
	theme: {
		extend: {
			colors: {
				'shironeri': '#fcfaf2', // light background, dark text
				'sumi': '#1c1c1c', // dark background
				'keshizumi': '#434343', // light text
				'shironezumi': '#bdc0ba', // dark secondary text
				'momo': '#f596aa', // link color
				'usubeni': '#e87a90', // link hover color
				'byakuroku': '#a8d8b9', // dark link color
				'wakatake': '#5dac81', // dark link hover color
			},
			typography: ({ theme }) => ({
				default: {
					css: {
						pre: false,
						code: false,
						'pre code': false,
						'code::before': false,
						'code::after': false
					}
				},
				keshizumi: {
					css: {
						'--tw-prose-body': theme('colors.keshizumi'),
						'--tw-prose-headings': theme('colors.keshizumi'),
						'--tw-prose-lead': theme('colors.keshizumi'),
						'--tw-prose-links': theme('colors.keshizumi'),
						'--tw-prose-bold': theme('colors.keshizumi'),
						'--tw-prose-counters': theme('colors.keshizumi'),
						'--tw-prose-bullets': theme('colors.keshizumi'),
						'--tw-prose-hr': theme('colors.keshizumi'),
						'--tw-prose-quotes': theme('colors.keshizumi'),
						'--tw-prose-quote-borders': theme('colors.keshizumi'),
						'--tw-prose-captions': theme('colors.keshizumi'),
						'--tw-prose-code': theme('colors.keshizumi'),
						'--tw-prose-pre-code': theme('colors.keshizumi'),
						'--tw-prose-pre-bg': theme('colors.keshizumi'),
						'--tw-prose-th-borders': theme('colors.keshizumi'),
						'--tw-prose-td-borders': theme('colors.keshizumi'),
						'--tw-prose-invert-body': theme('colors.keshizumi'),
						'--tw-prose-invert-headings': theme('colors.keshizumi'),
						'--tw-prose-invert-lead': theme('colors.keshizumi'),
						'--tw-prose-invert-links': theme('colors.keshizumi'),
						'--tw-prose-invert-bold': theme('colors.keshizumi'),
						'--tw-prose-invert-counters': theme('colors.keshizumi'),
						'--tw-prose-invert-bullets': theme('colors.keshizumi'),
						'--tw-prose-invert-hr': theme('colors.keshizumi'),
						'--tw-prose-invert-quotes': theme('colors.keshizumi'),
						'--tw-prose-invert-quote-borders': theme('colors.keshizumi'),
						'--tw-prose-invert-captions': theme('colors.keshizumi'),
						'--tw-prose-invert-code': theme('colors.keshizumi'),
						'--tw-prose-invert-pre-code': theme('colors.keshizumi'),
						'--tw-prose-invert-pre-bg': theme('colors.keshizumi'),
						'--tw-prose-invert-th-borders': theme('colors.keshizumi'),
						'--tw-prose-invert-td-borders': theme('colors.keshizumi'),
					},
				},
				shironeri: {
					css: {
						'--tw-prose-body': theme('colors.shironeri'),
						'--tw-prose-headings': theme('colors.shironeri'),
						'--tw-prose-lead': theme('colors.shironeri'),
						'--tw-prose-links': theme('colors.shironeri'),
						'--tw-prose-bold': theme('colors.shironeri'),
						'--tw-prose-counters': theme('colors.shironeri'),
						'--tw-prose-bullets': theme('colors.shironeri'),
						'--tw-prose-hr': theme('colors.shironeri'),
						'--tw-prose-quotes': theme('colors.shironeri'),
						'--tw-prose-quote-borders': theme('colors.shironeri'),
						'--tw-prose-captions': theme('colors.shironeri'),
						'--tw-prose-code': theme('colors.shironeri'),
						'--tw-prose-pre-code': theme('colors.shironeri'),
						'--tw-prose-pre-bg': theme('colors.shironeri'),
						'--tw-prose-th-borders': theme('colors.shironeri'),
						'--tw-prose-td-borders': theme('colors.shironeri'),
						'--tw-prose-invert-body': theme('colors.shironeri'),
						'--tw-prose-invert-headings': theme('colors.shironeri'),
						'--tw-prose-invert-lead': theme('colors.shironeri'),
						'--tw-prose-invert-links': theme('colors.shironeri'),
						'--tw-prose-invert-bold': theme('colors.shironeri'),
						'--tw-prose-invert-counters': theme('colors.shironeri'),
						'--tw-prose-invert-bullets': theme('colors.shironeri'),
						'--tw-prose-invert-hr': theme('colors.shironeri'),
						'--tw-prose-invert-quotes': theme('colors.shironeri'),
						'--tw-prose-invert-quote-borders': theme('colors.shironeri'),
						'--tw-prose-invert-captions': theme('colors.shironeri'),
						'--tw-prose-invert-code': theme('colors.shironeri'),
						'--tw-prose-invert-pre-code': theme('colors.shironeri'),
						'--tw-prose-invert-pre-bg': theme('colors.shironeri'),
						'--tw-prose-invert-th-borders': theme('colors.shironeri'),
						'--tw-prose-invert-td-borders': theme('colors.shironeri'),
					},
				},
			}),
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('preline/plugin'),
	],
	darkMode: ['variant', [
		'@media (prefers-color-scheme: dark) { &:not(.light *) }',
		'&:is(.dark *)',
	]],
}
