import {z} from 'zod';
export const postSchema=z.object({id:z.string().min(1).max(100),title:z.string().trim().min(1).max(180),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),excerpt:z.string().max(500),body:z.string().max(60000),category:z.string().max(80),tags:z.string().max(300),cover:z.string().regex(/^$|^\/api\/images\/[a-f0-9-]+\.(png|jpg|webp)$/),alt:z.string().max(250),status:z.enum(['draft','published']),date:z.string().date()});
export const blogSchema=z.object({enabled:z.boolean(),posts:z.array(postSchema).max(100)}).refine(d=>new Set(d.posts.map(p=>p.slug)).size===d.posts.length,'Each post needs a unique URL.');
export type BlogPost=z.infer<typeof postSchema>;
export type Blog=z.infer<typeof blogSchema>;
