'use client';
import {useState} from 'react';
import Editor from './editor';
import BlogEditor from './blog-editor';
export default function AdminPanel(){const [tab,setTab]=useState('work');return <><nav className="admin-tabs" aria-label="Admin sections"><button aria-pressed={tab==='work'} onClick={()=>setTab('work')}>Work & enquiries</button><button aria-pressed={tab==='blog'} onClick={()=>setTab('blog')}>Blog</button><a href="/">View site ↗</a></nav><div hidden={tab!=='work'}><Editor/></div><div hidden={tab!=='blog'}><BlogEditor/></div></>}
