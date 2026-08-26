import { useState } from 'react';
import { ArrowUpRight, Blocks, BookOpen, Brain, ChevronDown, Cloud, Code2, Database, ExternalLink, KanbanSquare, Mail, PenLine, PlaySquare, SearchCode, ServerCog, Sparkles, TerminalSquare, Users, UsersRound, Workflow, X } from 'lucide-react';
import { projects } from '../data/data';

const iconRegistry = { Brain, Blocks, UsersRound, Workflow, SearchCode, Cloud, Code2, Database, ServerCog, Mail, PlaySquare, KanbanSquare, PenLine, Users, TerminalSquare, Sparkles };

function IconGlyph({ name, size = 24 }) {
  const Icon = iconRegistry[name] ?? Sparkles;
  return <Icon size={size} strokeWidth={1.5} />;
}

function ProjectCard({ project, index, onSelect }) {
  const isFeature = index % 7 === 0 || index % 7 === 3;
  return (
    <article onClick={() => onSelect(project)} className={`project-card group ${isFeature ? 'xl:col-span-6' : 'xl:col-span-3'}`}>
      <div className="project-card-art" aria-hidden="true"><IconGlyph name={project.icon} size={isFeature ? 58 : 42} /><span className="project-card-index">{String(index + 1).padStart(2, '0')}</span></div>
      <div className="relative z-10 flex min-h-52 flex-col justify-between p-5 sm:min-h-56 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div className="flex flex-wrap gap-2">{project.tags.slice(0, 2).map((tag) => <span key={tag} className="tag">{tag}</span>)}</div><span className="icon-button opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><ArrowUpRight size={15} /></span></div>
        <div><h3 className={`${isFeature ? 'text-2xl' : 'text-xl'} font-semibold tracking-tight`}>{project.title}</h3>{isFeature && <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-ink-accessible">{project.description}</p>}</div>
      </div>
    </article>
  );
}

export default function BentoGrid() {
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedProject, setSelectedProject] = useState(null);
  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-12">
        {visibleProjects.map((project, index) => <ProjectCard key={project.id} project={project} index={index} onSelect={setSelectedProject} />)}
      </div>
      {hasMore && <div className="mt-10 flex justify-center"><button type="button" onClick={() => setVisibleCount((count) => Math.min(count + 12, projects.length))} className="button-secondary">Load more archives <ChevronDown size={16} /></button></div>}

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={selectedProject.title}>
          <button type="button" aria-label="Close project details" onClick={() => setSelectedProject(null)} className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm" />
          <div className="panel relative z-10 max-h-[min(700px,90vh)] w-full max-w-2xl overflow-y-auto p-6 sm:p-9">
            <button type="button" aria-label="Close" onClick={() => setSelectedProject(null)} className="icon-button absolute right-5 top-5"><X size={17} /></button>
            <div className="mb-8 flex h-28 items-center justify-between rounded-2xl border border-accent/20 bg-accent/5 px-7 text-accent"><IconGlyph name={selectedProject.icon} size={56} /><span className="eyebrow text-accent">Project brief</span></div>
            <div className="flex flex-wrap gap-2">{selectedProject.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{selectedProject.title}</h2>
            <p className="mt-5 text-base leading-8 text-ink-accessible">{selectedProject.description}</p>
            <div className="mt-8 flex flex-wrap gap-3 border-t border-ink-line pt-6"><a className="button-primary" href={selectedProject.downloadUrl} target="_blank" rel="noreferrer"><BookOpen size={16} /> Read brief</a>{selectedProject.githubUrl && <a className="button-secondary" href={selectedProject.githubUrl} target="_blank" rel="noreferrer">GitHub <ExternalLink size={15} /></a>}{selectedProject.liveUrl && <a className="button-secondary" href={selectedProject.liveUrl} target="_blank" rel="noreferrer">Live site <ExternalLink size={15} /></a>}</div>
          </div>
        </div>
      )}
    </>
  );
}
