import {readBlog} from "@/lib/blog-storage";
import Navigation from "../navigation";
export default async function WorkLayout({children}:{children:React.ReactNode}){
 const {blog}=await readBlog();
 return <div className="work-shell"><header className="header work-header"><a className="wordmark" href="/"><img className="brand-logo" src="/images/otn-stack.svg" alt="Outside the Norm"/></a><Navigation homePage={false} blogEnabled={blog.enabled}/></header>{children}<footer className="work-footer"><a className="wordmark" href="/"><img className="brand-logo brand-logo-mark" src="/images/otn-mark-v2.svg" alt="Outside the Norm"/></a><p>Brand identity. Digital design. Clear purpose.</p><a className="footer-work-symbol" href="/work" aria-label="Explore all work" title="Explore all work"><img src="/images/otn-mark-v2.svg" width={48} height={48} alt=""/></a></footer></div>
}
