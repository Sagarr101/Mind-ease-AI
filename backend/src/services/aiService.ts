import { ChatMessage } from '../models/ChatMessage';

// Dictionary of therapeutic sentiment words
const EMOTION_KEYWORDS = {
  anxious: ['anxious', 'anxiety', 'worry', 'worried', 'scared', 'panic', 'fear', 'nervous', 'stressed', 'stress', 'tense', 'shaking', 'uneasy'],
  sad: ['sad', 'lonely', 'depressed', 'depression', 'cry', 'crying', 'unhappy', 'grief', 'hurt', 'hopeless', 'empty', 'alone', 'miserable'],
  angry: ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'hate', 'irritated', 'resentment', 'pissed', 'raged'],
  exhausted: ['tired', 'sleepy', 'exhausted', 'fatigue', 'drained', 'burnout', 'weary', 'overwhelmed', 'overwork', 'stressed out'],
  happy: ['happy', 'glad', 'good', 'great', 'excited', 'joy', 'wonderful', 'awesome', 'proud', 'love', 'content', 'blessed', 'peaceful'],
};

// Response configurations for CBT fallback
const CBT_RESPONSES = {
  anxious: {
    reflections: [
      "It sounds like you're holding onto a lot of tension and worry right now.",
      "Anxiety can feel so overwhelming, like a storm in your mind and body.",
      "I hear how much stress you're carrying, and it's completely understandable to feel unsettled."
    ],
    reframings: [
      "Often, our minds try to protect us by predicting the worst-case scenario. Let's try to pause and take a slow, deep breath.",
      "Grounding yourself in the present can help quiet those racing thoughts. Let's try the 5-4-3-2-1 technique or focus on a simple sensation."
    ],
    questions: [
      "What is one small thing in your direct control that you can focus on right now?",
      "Can we identify if this anxiety is about something happening this very second, or a worry about the future?",
      "Would you like to try a short breathing exercise together?"
    ]
  },
  sad: {
    reflections: [
      "I hear a deep sense of sadness and isolation in what you're sharing.",
      "It sounds like things feel really heavy and lonely for you right now.",
      "Thank you for being open about this sadness. It takes courage to acknowledge these feelings."
    ],
    reframings: [
      "Sadness is a heavy visitor, and it's okay to let yourself feel it without immediate pressure to 'fix' it.",
      "Remember that feelings are like clouds—they are passing states, even when they seem permanent."
    ],
    questions: [
      "If this sadness had a voice, what do you think it is trying to tell you that you need right now?",
      "Is there a small act of self-care—even just drinking a warm cup of tea—that we could plan for you today?",
      "Are you able to share what might have triggered this heavy feeling, or did it arrive slowly?"
    ]
  },
  angry: {
    reflections: [
      "I can feel the frustration and anger in your words. It makes complete sense to feel upset.",
      "It sounds like a boundary was crossed or something feels deeply unfair.",
      "Anger is a very powerful emotion, and it is completely valid that you feel this way."
    ],
    reframings: [
      "Anger is often a secondary emotion—a protective shield for underlying feelings of hurt, fear, or vulnerability.",
      "Let's channel this strong energy safely. Take a moment to feel where the anger is located physically in your body."
    ],
    questions: [
      "What lies beneath this anger? Do you feel hurt, let down, or misunderstood?",
      "What is a constructive way you can express or establish a boundary regarding this situation?",
      "Would it help to write out everything that feels unfair without filtering it?"
    ]
  },
  exhausted: {
    reflections: [
      "It sounds like you are completely drained and running on empty.",
      "Overwhelm and fatigue are clear signs that you've been carrying too much for too long.",
      "I hear how exhausted you are, both mentally and physically."
    ],
    reframings: [
      "Rest is not something we earn; it is a fundamental need. You don't have to carry everything today.",
      "Sometimes 'doing nothing' is the most productive action we can take for our long-term wellness."
    ],
    questions: [
      "What is one task or expectation you can give yourself permission to let go of today?",
      "If you could rest fully for just 15 minutes, what would that look like for you?",
      "How is your sleep and physical nourishment looking lately?"
    ]
  },
  happy: {
    reflections: [
      "That is wonderful! I can feel the positive energy and light in your message.",
      "It's so beautiful to hear you sharing this moment of joy.",
      "I'm so glad to celebrate this positive experience with you!"
    ],
    reframings: [
      "Savoring these positive moments is a key CBT practice. It helps wire our brains to notice goodness and build resilience.",
      "Let yourself fully absorb this feeling of achievement and peace."
    ],
    questions: [
      "What do you think contributed to this positive state today?",
      "How can you anchor this feeling so you can recall it during tougher times?",
      "Who is someone you might want to share this positive energy with today?"
    ]
  },
  neutral: {
    reflections: [
      "I appreciate you sharing that with me.",
      "It sounds like you're reflecting on your current state and experiences.",
      "I'm here to listen and help you unpack those thoughts."
    ],
    reframings: [
      "Taking time to step back and reflect objectively is a great way to gain clarity.",
      "Examining our daily patterns allows us to make more conscious, healthy choices."
    ],
    questions: [
      "Would you like to explore this topic further, or focus on a specific area like mood logging or habits?",
      "How are you feeling in your body as you write these reflections?",
      "What is one goal you'd like to set for yourself this week?"
    ]
  }
};

// Simple local sentiment classifier
export const classifyLocalSentiment = (message: string): 'Positive' | 'Negative' | 'Neutral' => {
  const text = message.toLowerCase();
  
  let score = 0;
  
  // Positive words
  EMOTION_KEYWORDS.happy.forEach(w => { if (text.includes(w)) score++; });
  
  // Negative words
  EMOTION_KEYWORDS.anxious.forEach(w => { if (text.includes(w)) score--; });
  EMOTION_KEYWORDS.sad.forEach(w => { if (text.includes(w)) score--; });
  EMOTION_KEYWORDS.angry.forEach(w => { if (text.includes(w)) score--; });
  EMOTION_KEYWORDS.exhausted.forEach(w => { if (text.includes(w)) score--; });

  if (score > 0) return 'Positive';
  if (score < 0) return 'Negative';
  return 'Neutral';
};

// Local CBT therapist responder
const getLocalCBTReply = (message: string): { reply: string; sentiment: string } => {
  const text = message.toLowerCase();
  let category: keyof typeof CBT_RESPONSES = 'neutral';
  
  let maxCount = 0;
  
  // Score categories
  Object.keys(EMOTION_KEYWORDS).forEach((catKey) => {
    const key = catKey as keyof typeof EMOTION_KEYWORDS;
    const matches = EMOTION_KEYWORDS[key].filter(word => text.includes(word)).length;
    if (matches > maxCount) {
      maxCount = matches;
      category = key as keyof typeof CBT_RESPONSES;
    }
  });

  const pool = CBT_RESPONSES[category];
  const ref = pool.reflections[Math.floor(Math.random() * pool.reflections.length)];
  const reframe = pool.reframings[Math.floor(Math.random() * pool.reframings.length)];
  const question = pool.questions[Math.floor(Math.random() * pool.questions.length)];

  // Pretty construct
  const reply = `${ref}\n\n${reframe}\n\n${question}`;
  
  // Map category back to simplified sentiment label for DB storage
  let sentiment = 'Neutral';
  if ((category as string) === 'happy') sentiment = 'Positive';
  if (['anxious', 'sad', 'angry', 'exhausted'].includes(category as any)) sentiment = 'Negative';

  return { reply, sentiment: `${sentiment} (${category})` };
};

// Main function handling external LLM queries or falling back locally
export const analyzeSentimentAndRespond = async (
  userId: string,
  conversationIdOrMessage: string,
  messageOrUndefined?: string
): Promise<{ reply: string; sentiment: string }> => {
  // Support both old (userId, message) and new (userId, conversationId, message) signatures
  const conversationId = messageOrUndefined ? conversationIdOrMessage : undefined;
  const userMessage = messageOrUndefined || conversationIdOrMessage;
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Build contextual system prompt
  let systemPrompt = `You are MindEase AI, an empathetic, supportive, and professional AI mental health therapist.
Your response must employ principles of Cognitive Behavioral Therapy (CBT), active listening, and mindfulness guidance.
Always validate user feelings, maintain a calm and reassuring tone, provide constructive cognitive reframing, and end with an open-ended therapeutic question.
Do not prescribe medication, diagnose mental health conditions, or make medical claims. Keep responses conversational, readable (using paragraphs), and concise (2-3 short paragraphs).
At the very end of your response, output a single line format: [SENTIMENT: <sentiment>] where <sentiment> is one of: Joy, Anxiety, Sadness, Anger, Exhaustion, Neutral.`;

  // Add long-term memory context if conversationId is provided
  if (conversationId) {
    try {
      const chatService = require('../services/chatService').default;
      const history = await chatService.getConversationHistory(conversationId, 10);
      if (history && history.length > 0) {
        const recentContext = history.map((m: any) => `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`).join('\n');
        systemPrompt += `\n\nRecent Conversation History:\n${recentContext}`;
      }
    } catch (e) {
      // Silently skip if history retrieval fails
    }
  }

  // 1. Try Gemini API
  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser says: "${userMessage}"` }
            ]
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const fullText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        if (fullText) {
          // Parse sentiment tag from response if present
          let sentiment = 'Neutral';
          const match = fullText.match(/\[SENTIMENT:\s*(\w+)\]/i);
          let cleanedReply = fullText;
          if (match) {
            sentiment = match[1];
            cleanedReply = fullText.replace(/\[SENTIMENT:\s*\w+\]/i, '').trim();
          }
          return { reply: cleanedReply, sentiment };
        }
      }
    } catch (error) {
      console.error('Gemini API call failed, using CBT local engine:', error);
    }
  }

  // 2. Try OpenAI API
  if (openaiKey) {
    try {
      const endpoint = 'https://api.openai.com/v1/chat/completions';
      const payload = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const fullText = data.choices?.[0]?.message?.content || '';
        
        if (fullText) {
          let sentiment = 'Neutral';
          const match = fullText.match(/\[SENTIMENT:\s*(\w+)\]/i);
          let cleanedReply = fullText;
          if (match) {
            sentiment = match[1];
            cleanedReply = fullText.replace(/\[SENTIMENT:\s*\w+\]/i, '').trim();
          }
          return { reply: cleanedReply, sentiment };
        }
      }
    } catch (error) {
      console.error('OpenAI API call failed, using CBT local engine:', error);
    }
  }

  // 3. Fallback to Local Rules CBT
  return getLocalCBTReply(userMessage);
};
