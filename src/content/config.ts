import { defineCollection, z } from 'astro:content';

const article = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		categories: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const announcement = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
	}),
});

const footer = defineCollection({
	type: 'content',
	schema: z.object({
		type: z.enum(['link', 'script']).optional(),
		title: z.string().optional(),
		url: z.string().optional(),
		target: z.enum(['_blank', '_self']).optional(),
		icon: z.string().optional(),
	}),
});

export const collections = { article, announcement, footer };
