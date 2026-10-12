import {database} from './storage';
import type {Blog} from './blog';
export async function readBlog(){const row=await database().prepare('SELECT data,revision FROM content WHERE id = ?').bind('blog').first<{data:string;revision:number}>();return {blog:row?JSON.parse(row.data) as Blog:{enabled:false,posts:[]},revision:row?.revision||0};}
export function publishedPosts(blog:Blog){return blog.enabled?blog.posts.filter(p=>p.status==='published').sort((a,b)=>b.date.localeCompare(a.date)):[];}
