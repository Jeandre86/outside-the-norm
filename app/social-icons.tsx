// Add profile URLs here when the studio accounts are ready.
const profiles = [
  { name: "Instagram", href: "", icon: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></> },
  { name: "Facebook", href: "", icon: <path d="M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1.5A24 24 0 0 0 15 1c-3 0-5 2-5 5v3H7v4h3v8" fill="currentColor" stroke="none"/> },
  { name: "Dribbble", href: "", icon: <><circle cx="12" cy="12" r="9"/><path d="M7 4c5 6 7 11 8 16M3 11c7 0 12-2 16-6M5 18c3-6 8-8 16-6"/></> },
  { name: "LinkedIn", href: "", icon: <><rect x="3" y="9" width="4" height="12" fill="currentColor" stroke="none"/><circle cx="5" cy="4.5" r="2" fill="currentColor" stroke="none"/><path d="M11 21V9h4v2c1-3 6-3 6 2v8h-4v-7c0-2-2-2-2 0v7" fill="currentColor" stroke="none"/></> },
];
export default function SocialIcons() {
  return <div className="rail-socials" aria-label="Social media">{profiles.map(({name,href,icon}) => {
    const graphic = <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>;
    return href ? <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer">{graphic}</a> : <span key={name} role="img" aria-label={name} title={name}>{graphic}</span>;
  })}</div>;
}
