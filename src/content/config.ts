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
		type: z.enum(['link', 'script']),
		name: z.string().optional(), // link
		icon: z.string().optional(), // link (if icon is set, body will be ignored)
		attributes: z.union([
			z.object({
				href: z.string(),
				target: z.enum(['_blank', '_self']).optional(),
			}),
			z.object({
				src: z.string(),
				async: z.boolean().optional(),
				crossorigin: z.enum(['anonymous', 'use-credentials']).optional(),
				defer: z.boolean().optional(),
				integrity: z.string().optional(),
				nomodule: z.boolean().optional(),
				referrerpolicy: z.enum(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url']).optional(),
				type: z.string().optional(),
			}).optional(),
		]),
	}).superRefine((data, ctx) => {
		if (data.type === 'link') {
			if (!data.name) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Title is required for link type',
				});
			}
		} else if (data.type === 'script' && (data.name || data.icon)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Title and icon are not allowed for script type',
			});
		}
	}),
});

export const collections = { article, announcement, footer };
