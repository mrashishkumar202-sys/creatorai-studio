"use client";

import { useEffect, useMemo, useState } from "react";

type ToolId = "titles" | "story" | "image-prompt" | "scene-planner" | "seo" | "rewrite";
type Tool = { id: ToolId; name: string; desc: string; icon: string; category: string };
const tools: Tool[] = [
  { id: "titles", name: "YouTube Title Generator", desc: "Clickable title ideas grouped by style.", icon: "✦", category: "YouTube" },
  { id: "story", name: "Hindi Story Generator", desc: "Hooks, narration, dialogue and endings.", icon: "📖", category: "Writing" },
  { id: "image-prompt", name: "3D Image Prompt Generator", desc: "Cinematic prompts with continuity notes.", icon: "🎨", category: "Visuals" },
  { id: "scene-planner", name: "Scene-by-Scene Planner", desc: "Turn stories into ready-to-produce scenes.", icon: "🎬", category: "Video" },
  { id: "seo", name: "Description & Hashtags", desc: "Descriptions, keywords and thumbnail concepts.", icon: "⌕", category: "YouTube" },
  { id: "rewrite", name: "Hindi & English Rewriter", desc: "Translate, polish or simplify your script.", icon: "文", category: "Writing" }
];
const examples: Record<ToolId, { label: string; placeholder: string; prompt: string }> = {
  titles: { label: "Video topic", placeholder: "e.g. Two sisters build a momo business", prompt: "Topic, language, category, tone, number of titles" },
  story: { label: "Story idea", placeholder: "e.g. Two sisters start a small momo stall in a village", prompt: "Topic, language, duration, characters, setting, genre, ending or moral" },
  "image-prompt": { label: "Scene or character", placeholder: "e.g. Two sisters cooking momos in a village stall", prompt: "Topic, style, character details, setting, aspect ratio, negative prompt" },
  "scene-planner": { label: "Paste your story", placeholder: "Paste a story to split into scenes...", prompt: "Story, language, scene duration, aspect ratio" },
  seo: { label: "Video topic or summary", placeholder: "Describe what your video is about...", prompt: "Topic, language, category, audience, tone" },
  rewrite: { label: "Text to rewrite", placeholder: "Paste Hindi, Hinglish or English text...", prompt: "Text, operation, target language, desired tone" }
};

export default function Home() {
  const [active, setActive] = useState<ToolId>("titles");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [duration, setDuration] = useState("5 minutes");
  const [tone, setTone] = useState("Emotional and engaging");
  const [style, setStyle] = useState("Cinematic 3D cartoon");
  const [ratio, setRatio] = useState("16:9");
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [page, setPage] = useState("Dashboard");
  const [search, setSearch] = useState("");
  const [apiReady, setApiReady] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(d => setApiReady(Boolean(d.aiConfigured))).catch(() => setApiReady(false));
    try { setSaved(JSON.parse(localStorage.getItem("creatorai-saved") || "[]")); } catch { setSaved([]); }
  }, []);
  const current = tools.find(t => t.id === active)!;
  const filtered = useMemo(() => tools.filter(t => `${t.name} ${t.desc} ${t.category}`.toLowerCase().includes(search.toLowerCase())), [search]);

  async function generate() {
    if (!topic.trim()) { setError("Please enter a topic or text first."); return; }
    setLoading(true); setError(""); setResult("");
    const input: Record<string, unknown> = { topic, language, tone, duration, style, aspectRatio: ratio, additionalInstructions: extra };
    if (active === "rewrite") { input.text = topic; input.operation = extra || "Make this clear and voiceover-friendly"; }
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: active, input }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setResult(data.result);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }
  function saveResult() {
    if (!result) return;
    const entry = `${current.name}\n${new Date().toLocaleString()}\n\n${result}`;
    const next = [entry, ...saved].slice(0, 30);
    setSaved(next);
    try { localStorage.setItem("creatorai-saved", JSON.stringify(next)); } catch {}
  }
  function downloadResult() {
    if (!result) return;
    const blob = new Blob([`${current.name}\n\n${result}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `creatorai-${active}.txt`; a.click(); URL.revokeObjectURL(url);
  }
  const navItems = [{ label: "Dashboard", icon: "▦" }, { label: "AI Tools", icon: "✧" }, { label: "My Projects", icon: "▤" }, { label: "Pricing", icon: "◇" }, { label: "Settings", icon: "⚙" }];

  return <main className={dark ? "app dark" : "app"}>
    <aside className="sidebar">
      <button className="brand" onClick={() => setPage("Dashboard")}><span className="brand-mark">C✦</span><span>CreatorAI <b>Studio</b></span></button>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(n => <button key={n.label} className={`nav-item ${page === n.label ? "selected" : ""}`} onClick={() => setPage(n.label)}><span className="nav-icon">{n.icon}</span>{n.label}{n.label === "My Projects" && saved.length > 0 && <span className="nav-count">{saved.length}</span>}</button>)}</nav>
      <div className="sidebar-spacer" />
      <div className="upgrade-card"><div className="sparkle">✦</div><b>Make something amazing</b><p>Your next great video starts with an idea.</p><button onClick={() => {setPage("AI Tools");setActive("story");}}>Explore AI tools <span>→</span></button></div>
      <div className="user-mini"><div className="avatar">C</div><div><b>Creator workspace</b><small>Starter preview</small></div><span className="dots">•••</span></div>
    </aside>

    <section className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span className="slash">/</span><b>{page}</b></div>
        <div className="top-actions"><span className={`status ${apiReady ? "online" : "offline"}`}><i />{apiReady === null ? "Checking AI…" : apiReady ? "AI connected" : "AI setup needed"}</span><button className="icon-button" title="Toggle light/dark mode" onClick={() => setDark(!dark)}>{dark ? "☀" : "☾"}</button><div className="avatar top-avatar">C</div></div>
      </header>

      {page === "Dashboard" || page === "AI Tools" ? <div className="content">
        <div className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR CREATIVE WORKSPACE</div><h1>Bring your next big idea <span>to life.</span></h1><p className="subtitle">Your creative co-pilot for stories, videos, and everything in between.</p></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-core">✦</div><span className="art-chip chip-one">Aa</span><span className="art-chip chip-two">▶</span><span className="art-chip chip-three">✧</span></div></div>
        <div className="stats-grid"><div className="stat-card"><div className="stat-top"><span className="stat-icon purple">✧</span><span className="stat-trend">READY TO CREATE</span></div><strong>6</strong><span className="stat-label">AI creative tools</span><div className="stat-foot">One workspace, many possibilities</div></div><div className="stat-card"><div className="stat-top"><span className="stat-icon blue">▤</span><span className="stat-trend neutral">ON THIS DEVICE</span></div><strong>{saved.length}</strong><span className="stat-label">Saved generations</span><div className="stat-foot">Stored locally in this browser</div></div><div className="stat-card"><div className="stat-top"><span className="stat-icon peach">◉</span><span className="stat-trend neutral">PROVIDER STATUS</span></div><strong className="status-number">{apiReady ? "Ready" : "Setup"}</strong><span className="stat-label">AI connection</span><div className="stat-foot">{apiReady ? "Provider key detected" : "Add your server-side API key"}</div></div></div>
        <div className="section-heading"><div><h2>{page === "AI Tools" ? "All AI tools" : "Start creating"}</h2><p>Choose a tool and turn your idea into something real.</p></div><div className="search-box"><span>⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tools..." /></div></div>
        <div className="tool-grid">{filtered.map((t, i) => <button key={t.id} className={`tool-card ${active === t.id ? "active-tool" : ""}`} onClick={() => {setActive(t.id);setPage("AI Tools");setResult("");setError("");}}><div className={`tool-icon icon-${i % 4}`}>{t.icon}</div><div className="tool-card-title">{t.name}<span className="arrow">↗</span></div><p>{t.desc}</p><div className="tool-card-bottom"><span>{t.category}</span><span className="use-link">Use tool <b>→</b></span></div></button>)}</div>
        <section className="studio-panel">
          <div className="studio-heading"><div><span className="studio-label">AI STUDIO</span><h2>{current.name}</h2><p>{current.desc}</p></div><span className="live-badge"><i /> GENERATION WORKSPACE</span></div>
          <div className="studio-form">
            <label className="field wide"><span>{examples[active].label} <em>*</em></span><textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder={examples[active].placeholder} rows={3} maxLength={10000} /></label>
            <label className="field"><span>Output language</span><select value={language} onChange={e => setLanguage(e.target.value)}><option>Hindi</option><option>Hinglish</option><option>English</option></select></label>
            <label className="field"><span>Duration</span><select value={duration} onChange={e => setDuration(e.target.value)}><option>1 minute</option><option>3 minutes</option><option>5 minutes</option><option>8 minutes</option><option>10-second scenes</option></select></label>
            <label className="field"><span>Creative tone</span><select value={tone} onChange={e => setTone(e.target.value)}><option>Emotional and engaging</option><option>Educational</option><option>Suspenseful</option><option>Funny and lighthearted</option><option>Professional</option></select></label>
            <label className="field"><span>Visual style</span><select value={style} onChange={e => setStyle(e.target.value)}><option>Cinematic 3D cartoon</option><option>Realistic cinematic 3D</option><option>2D illustration</option><option>Clean and minimal</option><option>Not applicable</option></select></label>
            <label className="field"><span>Aspect ratio</span><select value={ratio} onChange={e => setRatio(e.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></label>
            <label className="field wide"><span>Extra instructions <small>(optional)</small></span><input value={extra} onChange={e => setExtra(e.target.value)} placeholder="Characters, setting, moral, negative prompts, or other preferences..." /></label>
          </div>
          <div className="generate-row"><p><span className="secure-icon">♧</span> Your API key stays on the server.</p><button className="generate-button" disabled={loading} onClick={generate}>{loading ? <><span className="spinner" /> Creating...</> : <>✦ Generate content <span>→</span></>}</button></div>
          {error && <div className="error-box" role="alert"><b>Could not generate content</b><p>{error}</p></div>}
          {result && <div className="result-box"><div className="result-heading"><div><span className="studio-label">YOUR GENERATION</span><h3>Ready for your next step</h3></div><div className="result-actions"><button onClick={() => navigator.clipboard.writeText(result).catch(() => setError("Clipboard unavailable. Please select and copy the result manually."))}>Copy text</button><button onClick={saveResult}>Save</button><button onClick={downloadResult}>Export .txt</button></div></div><pre>{result}</pre></div>}
        </section>
        <footer>CreatorAI Studio <span>•</span> Built for creators, made for ideas. <a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/about">About</a><a href="/contact">Contact</a><a href="/faq">FAQ</a></footer>
      </div> : page === "My Projects" ? <div className="content secondary-page"><div className="eyebrow">YOUR LIBRARY</div><h1>My <span>Projects</span></h1><p className="subtitle">Saved generations in this browser.</p>{saved.length ? <div className="saved-list">{saved.map((s, i) => <article key={i} className="saved-card"><pre>{s}</pre><button onClick={() => {navigator.clipboard.writeText(s).catch(()=>{});}}>Copy</button><button onClick={() => {const n=saved.filter((_,j)=>i!==j);setSaved(n);localStorage.setItem("creatorai-saved",JSON.stringify(n));}}>Delete</button></article>)}</div> : <div className="empty-state"><div>▤</div><h2>Your creative library is waiting</h2><p>Generate content and press Save to keep it here on this device.</p><button className="generate-button" onClick={() => setPage("AI Tools")}>Explore AI tools →</button></div>}</div>
      : page === "Pricing" ? <div className="content secondary-page"><div className="eyebrow">SIMPLE PLANS</div><h1>Pricing that grows <span>with you.</span></h1><p className="subtitle">Plans are previews until billing and usage enforcement are configured.</p><div className="pricing-grid">{[["Free","₹0","Explore the basics",["Basic AI tools","Local saved results","Provider limits apply"]],["Creator","Configure","For consistent creators",["Expanded project workflow","Text export","Planned higher quotas"]],["Pro","Configure","For advanced workflows",["Advanced templates","Planned batch tools","Priority support if offered"]]].map(p=><article className="price-card" key={p[0]}><h2>{p[0]}</h2><div className="price">{p[1]}</div><p>{p[2]}</p><ul>{(p[3] as string[]).map(x=><li key={x}>✓ {x}</li>)}</ul><button onClick={() => setPage("AI Tools")}>{p[0] === "Free" ? "Start creating" : "Coming soon"}</button></article>)}</div></div>
      : <div className="content secondary-page"><div className="eyebrow">WORKSPACE PREFERENCES</div><h1>{page}</h1><p className="subtitle">{page === "Settings" ? "Manage your local workspace preferences." : "CreatorAI Studio workspace."}</p><div className="settings-card"><h2>{page === "Settings" ? "Appearance" : "Welcome to CreatorAI Studio"}</h2><p>{page === "Settings" ? "Switch between light and dark appearance." : "This MVP is designed to help you plan and write video content."}</p><button onClick={() => setDark(!dark)}>{dark ? "Switch to light mode" : "Switch to dark mode"}</button><p className="muted">Authentication, cloud sync, subscriptions, and account management need provider configuration before production use.</p></div></div>}
    </section>
  </main>;
}
