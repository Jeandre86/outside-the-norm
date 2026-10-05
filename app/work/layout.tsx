import Navigation from "../navigation";
export default function WorkLayout({children}:{children:React.ReactNode}){
 return <div className="work-shell"><header className="header work-header"><a className="wordmark" href="/">Ontwrp<span>.</span></a><Navigation homePage={false}/></header>{children}<footer className="work-footer"><a className="wordmark" href="/">Ontwrp<span>.</span></a><p>Brand identity. Digital design. Clear purpose.</p><a href="/work">Explore all work</a></footer></div>
}
