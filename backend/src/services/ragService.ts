import { KnowledgeBase } from '../models/KnowledgeBase';
import { logger } from '../utils/logger';

interface ChunkData {
  text: string;
  source: string;
  order: number;
}

export class RAGService {
  // Simple text-based chunking (no embeddings yet)
  chunkDocument(content: string, chunkSize = 200): string[] {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= chunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  // Ingest a CBT document into knowledge base
  async ingestDocument(title: string, content: string, source?: string) {
    try {
      const chunks = this.chunkDocument(content, 200);
      const chunkData = chunks.map((text, idx) => ({
        text,
        embeddingRef: undefined, // For future: add embedding generation here
        order: idx,
      }));

      const doc = await KnowledgeBase.create({
        title,
        source: source || 'System',
        content,
        chunks: chunkData,
      });

      logger.info(`Ingested document: ${title} (${chunks.length} chunks)`);
      return doc;
    } catch (error) {
      logger.error(`Failed to ingest document ${title}:`, error);
      throw error;
    }
  }

  // Simple TF-IDF-like retrieval (can be upgraded to semantic search with embeddings)
  async retrieveRelevantChunks(query: string, limit = 5): Promise<string[]> {
    try {
      const keywords = query.toLowerCase().split(' ').filter(w => w.length > 2);
      const docs = await KnowledgeBase.find({}).lean();

      const scored: { chunk: string; score: number }[] = [];

      for (const doc of docs) {
        if (!doc.chunks) continue;

        for (const chunk of doc.chunks as any[]) {
          const text = chunk.text.toLowerCase();
          let score = 0;

          // Simple relevance scoring based on keyword matches
          for (const keyword of keywords) {
            const count = (text.match(new RegExp(keyword, 'g')) || []).length;
            score += count;
          }

          if (score > 0) {
            scored.push({ chunk: chunk.text, score });
          }
        }
      }

      // Sort by score and return top chunks
      return scored.sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.chunk);
    } catch (error) {
      logger.error('Error retrieving relevant chunks:', error);
      return [];
    }
  }
}

export default new RAGService();
