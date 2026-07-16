interface PromptContext {
  userId: string;
  conversationId: string;
  history?: any[];
  message: string;
  extras?: any;
}

export const buildPrompt = (ctx: PromptContext): string => {
  const { history = [], message, extras } = ctx;
  // Simple concatenation for now; this will be extended with RAG + mood + journal
  const recent = history.slice(-10).map((m) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`).join('\n');
  let prompt = `You are MindEase AI. Use supportive CBT-based responses. Context:\n${recent}\nUser: ${message}`;
  if (extras && extras.kb) {
    prompt += `\nRelevant Knowledge:\n${extras.kb.join('\n')}`;
  }
  return prompt;
};

export default { buildPrompt };
