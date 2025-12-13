import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { analyticsData } from '../data/data';

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-12 max-w-7xl mx-auto">
      
      {/* Skill Radar */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-stone-200 dark:border-zinc-800 shadow-soft dark:shadow-none p-8">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Skill Distribution</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData}>
              <PolarGrid stroke="var(--chart-grid)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--chart-text)', fontSize: 12, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="#4f46e5"
                strokeWidth={2}
                fill="#4f46e5"
                fillOpacity={0.1}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline / Strategy */}
      <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-stone-200 dark:border-zinc-800 shadow-soft dark:shadow-none p-8 flex flex-col justify-center">
        <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-6">Evolutionary Timeline</h3>
        
        <div className="relative pl-8 border-l-2 border-stone-100 dark:border-zinc-800 space-y-8">
          <div className="relative">
            <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-stone-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 shadow-sm" />
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">Era of Web</h4>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Mastering the DOM, React internals, and state management patterns.</p>
          </div>
          
          <div className="relative">
            <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-stone-200 dark:bg-zinc-700 border-4 border-white dark:border-zinc-900 shadow-sm" />
            <h4 className="text-lg font-bold text-stone-900 dark:text-white">Era of Chain</h4>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Deep dive into distributed systems, consensus algorithms, and smart contracts.</p>
          </div>

          <div className="relative">
            <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full bg-swiss-accent border-4 border-white dark:border-zinc-900 shadow-md" />
            <h4 className="text-lg font-bold text-swiss-accent">Era of AI</h4>
            <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">Current focus: Agentic workflows, RAG pipelines, and local LLM orchestration.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

