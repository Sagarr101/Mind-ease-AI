import { KnowledgeBase } from '../models/KnowledgeBase';

class KnowledgeRepository {
  async addDocument(doc: any) {
    return KnowledgeBase.create(doc);
  }

  async searchText(query: string, limit = 5) {
    return KnowledgeBase.find({ $text: { $search: query } }).limit(limit).lean();
  }

  async getById(id: string) {
    return KnowledgeBase.findById(id).lean();
  }
}

export default new KnowledgeRepository();
