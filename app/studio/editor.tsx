"use client";
import CaseStudyFields from "./case-study-fields";
import { useEffect, useState } from "react";
import { orderedProjects, newestProjects, moveProject, type Project } from "@/lib/content";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
type Enquiry = {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
};
export default function Editor({ view = "work" }: {
    view?: "work" | "enquiries";
}) {
    const [selected, setSelected] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const [projects, setProjects] = useState<Project[]>([]);
    const [revision, setRevision] = useState(0);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [notice, setNotice] = useState("Loading…");
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [dirty, setDirty] = useState(false);
    useEffect(() => { Promise.all([fetch("/api/projects").then(async (r) => { if (!r.ok)
            throw Error(); return r.json() as Promise<{
            projects: Project[];
            revision: number;
        }>; }), fetch("/api/enquiries").then(async (r) => { if (!r.ok)
            throw Error(); return r.json() as Promise<Enquiry[]>; })]).then(([data, inbox]) => { setProjects(orderedProjects(data.projects).map((p, sortOrder) => ({ ...p, sortOrder }))); setRevision(data.revision); setEnquiries(inbox); setReady(true); setNotice(""); }).catch(() => setNotice("Unable to load your studio. Reload to try again.")); }, []);
    useEffect(() => { const warn = (e: BeforeUnloadEvent) => { if (dirty) {
        e.preventDefault();
        e.returnValue = "";
    } }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [dirty]);
    function move(id: string, target: number) { if (busy || query.trim())
        return; setProjects(rows => moveProject(rows, id, target)); setDirty(true); setNotice("Order changed. Save changes to update the home page."); }
    function change(id: string, key: keyof Project, value: string) { setDirty(true); setProjects(rows => rows.map(p => p.id === id ? { ...p, [key]: value } : p)); }
    async function save() { setBusy(true); setNotice(""); try {
        const r = await fetch("/api/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ projects, revision }) });
        const d = await r.json() as {
            error?: string;
            revision: number;
        };
        if (!r.ok)
            throw Error(d.error);
        setRevision(d.revision);
        setDirty(false);
        setNotice("Saved. Your website now shows these changes.");
    }
    catch (e) {
        setNotice(e instanceof Error ? e.message : "Could not save. Your edits are still here.");
    }
    finally {
        setBusy(false);
    } }
    return <><p>{view === "work" ? "Manage your portfolio. Select a project to edit its details and case study." : "Messages from your website contact form."}</p><p role="status" className="notice">{notice || (dirty ? "You have unsaved changes." : "All changes saved.")}</p>{ready && <><div hidden={view !== "work"}><div className="studio-actions"><Button onClick={save} disabled={busy || !dirty}>{busy ? "Working…" : "Save changes"}</Button><Button variant="outline" disabled={busy} onClick={() => { const id = crypto.randomUUID(); setSelected(id); setProjects([...projects, { id, name: "New project", service: "", description: "", status: "draft", image: "", alt: "", sortOrder: projects.length, publishedAt: new Date().toISOString().slice(0, 10) }]); setDirty(true); }}>Add project</Button><a href="/" target="_blank" rel="noreferrer">View website</a></div>{selected ? <div className="project-edit-heading"><Button variant="outline" disabled={busy} onClick={() => setSelected(null)}>← All work</Button><span>Editing one project · changes remain here until saved</span></div> : <><label className="admin-search">Search work<Input placeholder="Search by project or service" value={query} onChange={e => setQuery(e.target.value)}/></label><div className="work-order-help"><h3>Home page order</h3><p>Move projects with the arrows or drag a handle. The first two visible projects appear under Work with purpose. The first two in-progress projects appear under Taking shape. Drafts stay hidden.</p><div className="home-order-preview">{newestProjects(projects).filter(p => p.status !== "in-progress").slice(0, 2).map((p, index) => <div key={p.id}>{p.image && <img src={p.image} alt=""/>}<span>Home position {index + 1}<strong>{p.name}</strong></span></div>)}</div>{query.trim() && <p>Clear search to change the order.</p>}</div><div className="admin-project-list">{projects.filter(p => (p.name + " " + p.service).toLowerCase().includes(query.toLowerCase())).map(p => { const index = projects.findIndex(x => x.id === p.id); return <div className="admin-project-row work-sort-row" key={p.id} onDragOver={e => { if (!busy && !query.trim())
        e.preventDefault(); }} onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (projects.some(x => x.id === id))
        move(id, index); }}><span className="work-drag-handle" draggable={!busy && !query.trim()} title="Drag to reorder, or use the move buttons" aria-hidden="true" onDragStart={e => { e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'move'; }}>⠿</span><button className="work-sort-edit" disabled={busy} onClick={() => setSelected(p.id)}>{p.image ? <img src={p.image} alt=""/> : <span className="project-initial">{p.name.slice(0, 1)}</span>}<span><strong>{p.name}</strong><small>{p.service || "Add a service"}</small></span></button><span className="admin-status">{p.status === "unlabelled" ? "Visible" : p.status}</span><div className="work-sort-controls"><button type="button" disabled={busy || !!query.trim() || index === 0} aria-label={"Move " + p.name + " up"} onClick={() => move(p.id, index - 1)}>↑</button><button type="button" disabled={busy || !!query.trim() || index === projects.length - 1} aria-label={"Move " + p.name + " down"} onClick={() => move(p.id, index + 1)}>↓</button></div></div>; })}</div></>}{projects.filter(p => p.id === selected).map(p => <section className="studio-card" key={p.id}><h2 style={{ fontSize: 28, marginBottom: 24 }}>{p.name}</h2><fieldset disabled={busy} style={{ display: "grid", gap: 18 }}><label>Project name<Input value={p.name} maxLength={120} onChange={e => change(p.id, "name", e.target.value)}/></label><label>Service<Input value={p.service} maxLength={150} placeholder="e.g. Brand identity" onChange={e => change(p.id, "service", e.target.value)}/></label><label>Project website<Input type="url" placeholder="https://example.com" maxLength={2000} value={p.website || ""} onChange={e => change(p.id, "website", e.target.value)}/></label><label>Description<Textarea value={p.description} maxLength={3000} rows={3} onChange={e => change(p.id, "description", e.target.value)}/></label><div><label id={p.id + "-status"}>Project status</label><Select value={p.status} onValueChange={v => change(p.id, "status", v)}><SelectTrigger aria-labelledby={p.id + "-status"}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unlabelled">Visible without a status</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="in-progress">In progress</SelectItem><SelectItem value="draft">Draft — hidden from website</SelectItem></SelectContent></Select></div>{p.image && <img src={p.image} alt={p.alt || p.name} className="studio-image"/>}<label>Project image (PNG, JPEG, or WebP, up to 8 MB)<Input type="file" accept="image/png,image/jpeg,image/webp" onChange={async (e) => { const file = e.target.files?.[0]; if (!file)
        return; setBusy(true); setNotice("Uploading image…"); try {
        const form = new FormData();
        form.set("file", file);
        const r = await fetch("/api/images", { method: "POST", body: form });
        const data = await r.json() as {
            error?: string;
            url: string;
        };
        if (!r.ok)
            throw Error(data.error);
        change(p.id, "image", data.url);
        setNotice("Image uploaded. Save changes to show it on your website.");
    }
    catch (err) {
        setNotice(err instanceof Error ? err.message : "Upload failed.");
    }
    finally {
        setBusy(false);
    } }}/></label><label>Image description for accessibility<Input value={p.alt} maxLength={250} onChange={e => change(p.id, "alt", e.target.value)}/></label>{p.image && <Button variant="outline" onClick={() => change(p.id, "image", "")}>Remove image from project</Button>}<CaseStudyFields project={p} onBusy={setBusy} onNotice={setNotice} onChange={patch => { setDirty(true); setProjects(rows => rows.map(row => row.id === p.id ? { ...row, ...patch } : row)); }}/></fieldset></section>)}<Button onClick={save} disabled={busy || !dirty}>Save changes</Button></div><section hidden={view !== "enquiries"} style={{ marginTop: 30 }}><h2>Enquiries<span>.</span></h2><p>Messages submitted through your contact form appear here.</p>{enquiries.length === 0 ? <p className="notice">No enquiries yet.</p> : enquiries.map(e => <article className="studio-card" key={e.id}><h3>{e.name}</h3><a href={"mailto:" + e.email}>{e.email}</a><p style={{ whiteSpace: "pre-wrap", margin: "20px 0" }}>{e.message}</p><small>{new Date(e.created_at).toLocaleDateString()}</small></article>)}</section></>}</>;
}
