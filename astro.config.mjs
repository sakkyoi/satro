import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import vue from '@astrojs/vue';
import expressiveCode from 'astro-expressive-code';
import { expressiveCodePatcher } from './src/expressive-code-patcher';
import { pluginCollapsibleSections } from '@expressive-code/plugin-collapsible-sections'
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { scrollspyPatcher } from './src/scrollspy-patcher';
import sitemap from '@astrojs/sitemap';

/**
 * Load environment variables by loadEnv
 * see: https://docs.astro.build/en/guides/configuring-astro/#environment-variables
 */
const { SITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

/** @type {import('rehype-expressive-code').RehypeExpressiveCodeOptions} */
const rehypeExpressiveCodeOptions = {
    // You can add configuration options here
    plugins: [pluginCollapsibleSections(), expressiveCodePatcher()],
    themes: ['dracula', 'solarized-light'],
};

// https://astro.build/config
export default defineConfig({
    site: SITE_URL,
    integrations: [vue({
        template: {
            compilerOptions: {
                isCustomElement: tag => ["iconify-icon"].includes(tag),
            },
        },
        devtools: true,
    }), expressiveCode(rehypeExpressiveCodeOptions), mdx(), tailwind(), sitemap({})],
    markdown: {
        rehypePlugins: [
            rehypeSlug,
            [
                rehypeAutolinkHeadings,
                {
                    behavior: 'prepend',
                    content: [{
                        type: 'element',
                        tagName: 'iconify-icon',
                        properties: {
                            className: 'w-[1rem] h-[1rem] absolute left-[-1rem]',
                            icon: 'solar:link-linear',
                            width: '1rem',
                            height: '1rem',
                            inline: true,
                        },
                    }],
                    properties: {
                        className: '!text-keshizumi hover:text-keshizumi dark:!text-shironeri dark:hover:text-keshizumi before:content-none after:content-none opacity-0 group-hover:opacity-80 relative flex items-center',
                    },
                }
            ],
            scrollspyPatcher, // hey! put this after rehypeSlug and rehypeAutolinkHeadings
        ],
    },
});
