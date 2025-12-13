import { Router } from 'express';
import { client as qdrantClient } from '../services/vector.js';

const router = Router();

/**
 * GET / - Fetch knowledge graph data from Qdrant
 * Returns nodes and links for visualization
 */
router.get('/', async (req, res) => {
  try {
    console.log('[Graph] Fetching all vectors from Qdrant...');

    // Scroll through all points in the collection
    let allPoints = [];
    let offset = null;
    const limit = 100;

    do {
      const result = await qdrantClient.scroll('secondbrain', {
        limit,
        offset,
        with_payload: true,
        with_vector: true
      });

      allPoints = allPoints.concat(result.points);
      offset = result.next_page_offset;
    } while (offset !== null && offset !== undefined);

    console.log(`[Graph] Retrieved ${allPoints.length} points`);

    // Transform points to nodes
    const nodes = allPoints.map((point) => {
      // Simple dimensionality reduction: use first 2 dimensions scaled
      // Or use random coordinates for MVP
      const vector = point.vector;
      const x = vector[0] * 100; // Scale first dimension
      const y = vector[1] * 100; // Scale second dimension
      
      // Alternative: Random positioning (force-graph will auto-layout anyway)
      // const x = Math.random() * 200 - 100;
      // const y = Math.random() * 200 - 100;

      return {
        id: point.id,
        text: point.payload.text,
        source: point.payload.source || 'unknown',
        metadata: point.payload.metadata || {},
        x,
        y,
        // Group by source for coloring
        group: point.payload.source || 'unknown'
      };
    });

    // Create links between nodes from the same source
    const links = [];
    const sourceGroups = {};

    // Group nodes by source
    nodes.forEach(node => {
      if (!sourceGroups[node.source]) {
        sourceGroups[node.source] = [];
      }
      sourceGroups[node.source].push(node.id);
    });

    // Create links within each source group
    Object.values(sourceGroups).forEach(group => {
      for (let i = 0; i < group.length - 1; i++) {
        links.push({
          source: group[i],
          target: group[i + 1]
        });
      }
    });

    console.log(`[Graph] Generated ${nodes.length} nodes and ${links.length} links`);

    res.json({
      nodes,
      links,
      stats: {
        totalNodes: nodes.length,
        totalLinks: links.length,
        sources: Object.keys(sourceGroups).length
      }
    });
  } catch (error) {
    console.error('[Graph] Error generating graph:', error);
    res.status(500).json({ error: 'Failed to generate knowledge graph' });
  }
});

export default router;
