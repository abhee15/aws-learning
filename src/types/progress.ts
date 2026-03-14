export interface TopicProgress {
  topicSlug: string;
  sectionsRead: string[];
  lastVisited: string;
  timeSpentMinutes: number;
}

export interface QuizAttempt {
  questionId: string;
  selectedAnswers: string[];
  correct: boolean;
  timeSpentSeconds: number;
}

export interface QuizSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  mode: 'topic' | 'full-exam' | 'weak-areas' | 'timed-exam';
  topicSlug?: string;
  totalQuestions: number;
  attempts: QuizAttempt[];
  score: number;
  passed: boolean;
  domainScores?: Record<string, number>;
}

export interface FlashcardState {
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastResult: 'again' | 'hard' | 'good' | 'easy';
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  studyDates: string[];
}

export interface UserProgress {
  version: number;
  topics: Record<string, TopicProgress>;
  quizSessions: QuizSession[];
  flashcardStates: Record<string, FlashcardState>;
  streak: StudyStreak;
  weakAreas: string[];
  bookmarks: string[];
}
