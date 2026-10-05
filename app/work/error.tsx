"use client";
export default function WorkError({reset}:{reset:()=>void}){return <main className="section"><h1>Work is temporarily unavailable.</h1><p>We couldn’t load the project details. Please try again.</p><button className="cta" onClick={reset}>Try again</button><a className="back-link" href="/">Back to home</a></main>}
