import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { analyticsData, velocityData } from '../data/data';

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
      {/* Skill Radar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-technical font-bold text-slate-200 mb-4">Skill Radar</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="#a855f7"
                strokeWidth={2}
                fill="#a855f7"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growth Velocity */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-technical font-bold text-slate-200 mb-4">Growth Velocity</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f1f5f9' }}
                itemStyle={{ color: '#22d3ee' }}
              />
              <Line 
                type="monotone" 
                dataKey="commits" 
                stroke="#22d3ee" 
                strokeWidth={2} 
                dot={{ fill: '#22d3ee', r: 4 }} 
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line 
                type="monotone" 
                dataKey="experiments" 
                stroke="#a855f7" 
                strokeWidth={2} 
                dot={false}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Text */}
      <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-technical font-bold text-neon-cyan mb-4">Breadth-First, Depth-Next</h3>
        <p className="text-slate-300 leading-relaxed max-w-3xl">
          My approach to engineering is modeled after search algorithms. I explore a wide breadth of technologies—from low-level systems programming to high-level AI orchestration—to build a comprehensive mental map of the tech landscape. Once a critical node is identified, I switch to a depth-first traversal, mastering the specific stack required to solve the problem at hand. This "T-shaped" dynamic allows for rapid prototyping without sacrificing architectural integrity.
        </p>
      </div>
    </div>
  );
}
