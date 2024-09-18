import { getCollection } from 'astro:content';


export async function GET() {
    const siteUrl = import.meta.env.SITE_URL.replace(/^\/|\/$/g, '');

    const sitemaps = ['article', 'category', 'tag'];

    let sitemap = '';
    sitemap += '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    for (const sitemapName of sitemaps) {
        sitemap += `<sitemap><loc>${siteUrl}/sitemap-${sitemapName}.xml</loc></sitemap>`;
    }

    sitemap += '</sitemapindex>';

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
