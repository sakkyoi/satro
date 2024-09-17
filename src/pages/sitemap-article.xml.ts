import { getCollection } from 'astro:content';

export async function GET() {
    const siteUrl = import.meta.env.SITE_URL.replace(/^\/|\/$/g, '');
    const posts = await getCollection('article');

    let sitemap = '';
    sitemap += '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
    
    for (const post of posts) {
        const lastmod = (post.data.updatedDate || post.data.pubDate).toISOString().split('T')[0];
        sitemap += `<url><loc>${siteUrl}/article/${post.slug}</loc><lastmod>${lastmod}</lastmod></url>`;
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
