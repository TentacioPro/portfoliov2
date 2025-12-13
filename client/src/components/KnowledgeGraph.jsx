import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D from 'react-force-graph-2d';

const KnowledgeGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();
  const graphRef = useRef();

  // Color palette for different sources
  const sourceColors = {
    'sample-resume.pdf': '#3b82f6', // blue
    'portfolio': '#ef4444', // red
    'docs': '#10b981', // green
    'unknown': '#6b7280' // gray
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/graph');
      if (!response.ok) throw new Error('Failed to fetch graph data');
      
      const data = await response.json();
      setGraphData({ nodes: data.nodes, links: data.links });
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Error fetching graph:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const getNodeColor = (node) => {
    return sourceColors[node.source] || sourceColors.unknown;
  };

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-zinc-400">Loading Knowledge Graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button
            onClick={fetchGraphData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-white dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-white/80 dark:from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 dark:bg-zinc-900 hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Knowledge Graph</h1>
              {stats && (
                <p className="text-sm text-stone-500 dark:text-zinc-400">
                  {stats.totalNodes} nodes • {stats.totalLinks} connections • {stats.sources} sources
                </p>
              )}
            </div>
          </div>
          <button
            onClick={fetchGraphData}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-32 right-6 z-20 p-4 rounded-xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border border-stone-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Sources</h3>
        <div className="space-y-2">
          {Object.entries(sourceColors).map(([source, color]) => (
            <div key={source} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-stone-600 dark:text-zinc-400">{source}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Canvas */}
      <div className="w-full h-full">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel="id"
          nodeColor={getNodeColor}
          nodeRelSize={6}
          linkColor={() => 'rgba(100, 100, 100, 0.2)'}
          linkWidth={1}
          onNodeClick={handleNodeClick}
          onBackgroundClick={handleBackgroundClick}
          backgroundColor="transparent"
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.source;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            // Draw node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();

            // Draw label on hover
            if (node === selectedNode) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2 - 10,
                bckgDimensions[0],
                bckgDimensions[1]
              );

              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = 'white';
              ctx.fillText(label, node.x, node.y - 10);
            }
          }}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Node Detail Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-2xl w-full bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-stone-200 dark:border-zinc-800 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-stone-600 dark:text-zinc-400" />
              </button>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getNodeColor(selectedNode) }}
                  />
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {selectedNode.source}
                  </h2>
                </div>
                <p className="text-xs font-mono text-stone-400 dark:text-zinc-500">
                  ID: {selectedNode.id}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 max-h-96 overflow-y-auto">
                <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNode.text}
                </p>
              </div>

              {selectedNode.metadata && Object.keys(selectedNode.metadata).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-stone-600 dark:text-zinc-400 mb-2">
                    Metadata
                  </h3>
                  <div className="text-xs font-mono text-stone-500 dark:text-zinc-500">
                    {JSON.stringify(selectedNode.metadata, null, 2)}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeGraph;
