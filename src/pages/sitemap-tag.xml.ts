import { getCollection } from 'astro:content';


export async function GET() {
    const siteUrl = import.meta.env.SITE_URL.replace(/^\/|\/$/g, '');
    const posts = await getCollection('article');
    const tags = [...new Set(posts.map((post: any) => post.data.tags!).flat())];

    let sitemap = '';
    sitemap += '<?xml version="1.0" encoding="UTF-8"?>';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">';
    
    for (const tag of tags) {
        const latestPost = posts
            .sort((a, b) => (b.data.updatedDate || b.data.pubDate).getTime() - (a.data.updatedDate || a.data.pubDate).getTime())
            .find((post) => post.data.tags?.includes(tag));

        const lastmod = (latestPost?.data.updatedDate || latestPost?.data.pubDate)?.toISOString().split('T')[0];
        
        sitemap += `<url><loc>${siteUrl}/tag/${tag}</loc><lastmod>${lastmod}</lastmod></url>`;
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
