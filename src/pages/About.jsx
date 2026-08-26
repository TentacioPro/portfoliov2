import { ArrowLeft, ArrowUpRight, Compass, Github, MapPin, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { proudProjects, profile } from '../data/data';

export default function About() {
  return (
    <main className="min-h-screen bg-ink text-ink-text">
      <header className="site-shell flex items-center justify-between py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-ink-accessible transition-colors hover:text-ink-text">
          <ArrowLeft size={16} /> Back to archive
        </Link>
        <span className="eyebrow">About / 01</span>
      </header>

      <div className="site-shell pb-24 pt-12 sm:pt-20">
        <section className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-ink-line bg-ink-card sm:h-32 sm:w-32">
              <img src={profile.avatar} alt="Abishek" className="h-full w-full object-cover grayscale" />
            </div>
            <p className="eyebrow mb-3">The person behind the experiments</p>
            <h1 className="display-text max-w-4xl">I build with AI agents, ship with rigor, and track everything.</h1>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:pb-2">
            <div className="panel p-6">
              <MapPin className="mb-8 text-accent" size={20} />
              <p className="text-sm text-ink-accessible">Based in</p>
              <p className="mt-1 font-medium">{profile.location}</p>
            </div>
            <div className="panel p-6">
              <Mail className="mb-8 text-accent" size={20} />
              <p className="text-sm text-ink-accessible">Open to</p>
              <a href={`mailto:${profile.email}`} className="mt-1 block font-medium transition-colors hover:text-accent">Collaborations</a>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-10 border-t border-ink-line pt-10 lg:grid-cols-[0.7fr_1.3fr]">
          <p className="eyebrow">01 — Context</p>
          <div className="max-w-2xl space-y-6 text-lg leading-8 text-ink-accessible">
            <p className="text-ink-text">{profile.detail}</p>
            <p>I care about the details that make a project trustworthy: a clear constraint, observable behavior, fast feedback, and a paper trail that explains what changed.</p>
          </div>
        </section>

        <section className="mt-24 border-t border-ink-line pt-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">02 — Selected work</p>
              <h2 className="section-title">The five I return to</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-ink-accessible">Not the only work that matters, but the clearest signal of how I think and build.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {proudProjects.map(({ label, project }) => (
              <a key={label} href={project.githubUrl ?? '#'} target="_blank" rel="noreferrer" className="panel group flex min-h-48 flex-col justify-between p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-accent">{label}</span>
                  <Github size={16} className="text-ink-accessible transition-colors group-hover:text-ink-text" />
                </div>
                <div>
                  <p className="font-semibold">{project.title}</p>
                  <p className="mt-2 text-xs leading-5 text-ink-accessible">{project.tags.slice(0, 2).join(' · ')}</p>
                </div>
                <ArrowUpRight size={16} className="self-end text-ink-accessible transition-colors group-hover:text-accent" />
              </a>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-10 border-t border-ink-line pt-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow mb-3">03 — Now</p>
            <h2 className="section-title">Learning in public</h2>
          </div>
          <div className="panel grid gap-8 p-6 sm:grid-cols-[auto_1fr] sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent"><Compass size={22} /></div>
            <div>
              <p className="text-lg font-medium">Agentic systems, local inference, and the discipline around them.</p>
              <p className="mt-3 leading-7 text-ink-accessible">I am currently building small systems that make AI workflows more inspectable: local-first model infrastructure, agent handoffs, and evaluation loops that turn experiments into durable practice.</p>
            </div>
          </div>
        </section>

        <section className="mt-24 flex flex-col gap-6 border-t border-ink-line pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm text-ink-accessible"><Sparkles size={16} className="text-accent" /> Available for thoughtful work.</div>
          <a href={`mailto:${profile.email}`} className="button-primary">Start a conversation <ArrowUpRight size={16} /></a>
        </section>
      </div>
    </main>
  );
}
