import { ArrowDownRight, ArrowUpRight, Github, Mail, MoveRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { profile, projects } from '../data/data';
import BentoGrid from '../components/BentoGrid';

export default function Portfolio() {
  return (
    <main className="min-h-screen bg-ink text-ink-text">
      <header className="site-shell flex items-center justify-between py-6">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-black text-ink">A</span>
          <span>Tentacio<span className="text-ink-accessible">/lab</span></span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-ink-accessible sm:gap-7">
          <a href="#archive" className="transition-colors hover:text-ink-text">Archive</a>
          <Link to="/about" className="transition-colors hover:text-ink-text">About</Link>
          <a href={`mailto:${profile.email}`} className="hidden transition-colors hover:text-ink-text sm:block">Contact</a>
        </nav>
      </header>

      <section className="site-shell grid min-h-[70vh] items-center gap-12 pb-20 pt-16 lg:grid-cols-[1.2fr_0.8fr] lg:pt-24">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-medium text-accent"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Building in public</div>
          <h1 className="display-text max-w-5xl">Systems for the <span className="text-accent">useful</span> edge of the possible.</h1>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-accessible">{profile.detail}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#archive" className="button-primary">Explore the archive <ArrowDownRight size={16} /></a>
            <Link to="/about" className="button-secondary">About the builder <MoveRight size={16} /></Link>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-accent/5 blur-3xl" />
          <div className="panel relative overflow-hidden p-6 sm:p-8">
            <div className="mb-16 flex items-center justify-between text-xs text-ink-accessible"><span className="eyebrow">Signal / 2026</span><Sparkles size={16} className="text-accent" /></div>
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-ink-line pb-4"><span className="text-sm text-ink-accessible">Projects shipped</span><span className="text-3xl font-semibold">{projects.length}</span></div>
              <div className="flex items-center justify-between border-b border-ink-line pb-4"><span className="text-sm text-ink-accessible">Current focus</span><span className="text-right text-sm font-medium">Agentic systems</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-ink-accessible">Default mode</span><span className="flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-accent" /> Local-first</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="site-shell grid gap-6 border-y border-ink-line py-7 text-sm sm:grid-cols-3">
        <div><p className="eyebrow mb-2">01 / Approach</p><p className="text-ink-accessible">Find the constraint. Make it observable.</p></div>
        <div><p className="eyebrow mb-2">02 / Craft</p><p className="text-ink-accessible">Ship the smallest useful system.</p></div>
        <div><p className="eyebrow mb-2">03 / Record</p><p className="text-ink-accessible">Track decisions so momentum compounds.</p></div>
      </section>

      <section id="archive" className="site-shell scroll-mt-8 py-24">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow mb-3">Selected archive</p><h2 className="section-title">Experiments with receipts.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-ink-accessible">A living index of AI, full-stack, infrastructure, and systems work. Open a card for the context and the local write-up.</p>
        </div>
        <BentoGrid />
      </section>

      <footer className="site-shell flex flex-col gap-6 border-t border-ink-line py-8 text-sm text-ink-accessible sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Abishek / TentacioPro</p>
        <div className="flex gap-5"><a href="https://github.com/TentacioPro" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-ink-text"><Github size={15} /> GitHub</a><a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 hover:text-ink-text"><Mail size={15} /> Mail</a><Link to="/about" className="inline-flex items-center gap-2 hover:text-ink-text">About <ArrowUpRight size={15} /></Link></div>
      </footer>
    </main>
  );
}
