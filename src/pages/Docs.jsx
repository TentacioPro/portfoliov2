import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects } from '../data/data';

export default function Docs() {
  return (
    <main className="min-h-screen bg-ink text-ink-text">
      <header className="site-shell flex items-center justify-between py-6"><Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink-text"><ArrowLeft size={16} /> Back to archive</Link><span className="eyebrow">Documentation index</span></header>
      <section className="site-shell py-16 sm:py-24"><p className="eyebrow mb-4">Local briefs / {projects.length} entries</p><h1 className="display-text max-w-4xl">The work, with receipts.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-ink-muted">Short, local Markdown summaries for the projects in the archive. No CMS, no API, no hidden dependency.</p><div className="mt-16 divide-y divide-ink-line border-y border-ink-line">{projects.map((project, index) => <a key={project.id} href={project.downloadUrl} className="group flex items-center justify-between gap-4 py-5 hover:bg-ink-card/50"><div className="flex min-w-0 items-center gap-4"><span className="eyebrow w-8 text-accent">{String(index + 1).padStart(2, '0')}</span><span className="truncate font-medium">{project.title}</span></div><span className="flex shrink-0 items-center gap-2 text-sm text-ink-muted group-hover:text-ink-text"><BookOpen size={15} /> Read <ArrowUpRight size={15} /></span></a>)}</div></section>
    </main>
  );
}
