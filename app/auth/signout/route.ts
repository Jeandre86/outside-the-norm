import {authClient} from '@/lib/supabase/server';
import {sameOrigin} from '@/lib/editor-auth';
import {NextResponse} from 'next/server';
export async function POST(r:Request){if(!sameOrigin(r))return new Response(null,{status:403});await (await authClient()).auth.signOut();return NextResponse.redirect(new URL('/admin',r.url),303);}
export function GET(){return new Response('<form method="post"><button>Sign out</button></form>',{headers:{'Content-Type':'text/html','Cache-Control':'no-store'}});}
