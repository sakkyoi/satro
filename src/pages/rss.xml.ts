import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async (context) => {
    const article = await getCollection('article');
    
    return rss({
        title: SITE_TITLE,
        description: SITE_DESCRIPTION,
        site: context.site || '',
        items: article.map((item) => ({
            title: item.data.title,
            description: item.data.description,
            pubDate: item.data.pubDate,
            updatedDate: item.data.updatedDate,
            heroImage: item.data.heroImage,
            categories: item.data.categories,
            tags: item.data.tags,
            link: `${context.site || ''}/article/${item.slug}`,
        }))
    });
}
