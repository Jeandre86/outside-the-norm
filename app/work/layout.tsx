import {readBlog} from "@/lib/blog-storage";
import Navigation from "../navigation";
export default async function WorkLayout({children}:{children:React.ReactNode}){
 const {blog}=await readBlog();
 return <div className="work-shell"><header className="header work-header"><a className="wordmark" href="/">Ontwrp<span>.</span></a><Navigation homePage={false} blogEnabled={blog.enabled}/></header>{children}<footer className="work-footer"><a className="wordmark" href="/">Ontwrp<span>.</span></a><p>Brand identity. Digital design. Clear purpose.</p><a className="footer-work-symbol" href="/work" aria-label="Explore all work" title="Explore all work"><img src="/images/ontwrp-footer-symbol.png" width={48} height={48} alt=""/></a></footer></div>
}
