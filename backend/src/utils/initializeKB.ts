import ragService from '../services/ragService';
import { logger } from '../utils/logger';
import { KnowledgeBase } from '../models/KnowledgeBase';

const CBT_DOCUMENTS = [
  {
    title: 'Introduction to Cognitive Behavioral Therapy (CBT)',
    content: `Cognitive Behavioral Therapy (CBT) is a form of psychological treatment that focuses on modifying dysfunctional thinking and behavior.
    The core principle is that our thoughts, feelings, and behaviors are interconnected—changing one can change the others.
    CBT is evidence-based and has been proven effective for anxiety, depression, and many other conditions.
    The therapy involves identifying negative thought patterns and replacing them with more realistic and helpful thoughts.`,
  },
  {
    title: 'Managing Anxiety with CBT',
    content: `Anxiety is a normal response to stress, but when it becomes overwhelming, CBT techniques can help.
    Key strategies include: cognitive restructuring (challenging anxious thoughts), exposure therapy (gradually facing fears), and relaxation techniques.
    The anxiety cycle involves a trigger thought that leads to physical sensations, which reinforce the anxious thought.
    Breaking this cycle requires patience and consistent practice.
    Breathing exercises like 4-7-8 breathing can provide immediate relief during an anxious episode.`,
  },
  {
    title: 'Overcoming Depression Through CBT',
    content: `Depression often involves depressive thinking patterns like catastrophizing, overgeneralization, and self-criticism.
    CBT helps by identifying these patterns and testing them against evidence.
    Behavioral activation is crucial—even small steps like taking a walk or calling a friend can improve mood.
    Depression often involves withdrawal, but re-engaging with activities you once enjoyed is part of recovery.
    Setting realistic goals and celebrating small wins builds momentum.`,
  },
  {
    title: 'Stress Management Techniques',
    content: `Chronic stress can lead to physical and mental health problems. CBT offers several stress management strategies.
    Time management and prioritization help reduce overwhelming feelings.
    The Pomodoro technique (25-minute focused work intervals with 5-minute breaks) improves productivity and reduces stress.
    Saying "no" to non-essential commitments is crucial for maintaining boundaries.
    Regular exercise, adequate sleep, and healthy nutrition form the foundation of stress resilience.`,
  },
  {
    title: 'Mindfulness and Meditation',
    content: `Mindfulness is the practice of paying attention to the present moment without judgment.
    Regular meditation strengthens the ability to observe thoughts without getting caught in them.
    Body scan meditation involves progressively relaxing each part of your body, which reduces physical tension.
    Mindfulness helps create space between a thought and your reaction, giving you choice in how you respond.
    Even 10 minutes of daily meditation can improve overall well-being over time.`,
  },
  {
    title: 'Sleep Hygiene for Mental Health',
    content: `Sleep is fundamental to mental health. Poor sleep can worsen anxiety and depression.
    Sleep hygiene practices include: consistent sleep schedules, a dark cool bedroom, limiting screens before bed, and avoiding caffeine in the afternoon.
    The quality of sleep is as important as quantity. Aim for 7-9 hours nightly.
    If insomnia persists, cognitive therapy for insomnia (CBT-I) specifically addresses racing thoughts at bedtime.
    Blue light from devices can suppress melatonin; avoid screens 1 hour before sleep.`,
  },
  {
    title: 'Emotional Regulation and Coping',
    content: `Emotional regulation is the ability to manage and respond to emotional experiences in healthy ways.
    Healthy coping strategies include journaling, talking to trusted friends, exercise, and creative expression.
    Unhealthy coping (avoidance, substance use, aggression) provides temporary relief but worsens problems long-term.
    The TIPP technique (Temperature, Intense exercise, Paced breathing, Progressive muscle relaxation) can interrupt crisis moments.
    Building a personalized coping toolbox ensures you have strategies readily available during difficult times.`,
  },
  {
    title: 'Breathing Exercises for Anxiety',
    content: `Slow, controlled breathing activates the parasympathetic nervous system, calming your body.
    Box breathing: Breathe in for 4 counts, hold for 4, exhale for 4, hold for 4. Repeat 4-5 times.
    4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8. This pattern promotes calm and may aid sleep.
    Diaphragmatic breathing (belly breathing) is more effective than shallow chest breathing.
    Practice these techniques during calm moments so they become automatic during stress.`,
  },
  {
    title: 'Building Self-Esteem and Confidence',
    content: `Self-esteem is your overall sense of self-worth. CBT helps by challenging negative self-talk and building evidence of competence.
    Small wins matter. Completing tasks, learning new skills, and helping others all build self-esteem.
    Perfectionism is the enemy of self-esteem. Aiming for "good enough" reduces anxiety and improves satisfaction.
    Self-comparison, especially on social media, reduces confidence. Practice gratitude for your own progress instead.
    Positive affirmations work best when they're specific and believable, not overly optimistic platitudes.`,
  },
];

export async function initializeKnowledgeBase() {
  try {
    const existingDocs = await KnowledgeBase.countDocuments();
    if (existingDocs > 0) {
      logger.info('Knowledge base already initialized, skipping...');
      return;
    }

    logger.info('Initializing knowledge base with CBT documents...');

    for (const doc of CBT_DOCUMENTS) {
      await ragService.ingestDocument(doc.title, doc.content, 'CBT Curriculum');
    }

    logger.info('Knowledge base initialization complete!');
  } catch (error) {
    logger.error('Error initializing knowledge base:', error);
  }
}

export default { initializeKnowledgeBase };
