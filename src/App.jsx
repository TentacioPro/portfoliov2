import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { FilterBar } from './components/FilterBar';
import { ProjectCard } from './components/ProjectCard';
import { ProjectDetail } from './components/ProjectDetail';
import { projects, categories } from './data/projects';

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedId, setSelectedId] = useState(null);

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedId), 
  [selectedId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Hero />
        
        <FilterBar 
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedId(project.id)}
            />
          ))}
        </div>

        <AnimatePresence>
          {selectedId && selectedProject && (
            <ProjectDetail 
              project={selectedProject} 
              onClose={() => setSelectedId(null)} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
