import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { UserProgress, QuizSession } from '../types';
import { getItem, setItem } from '../utils/localStorage';
import { updateFlashcard, createNewCard } from '../utils/spacedRepetition';

const DEFAULT_PROGRESS: UserProgress = {
  version: 1,
  topics: {},
  quizSessions: [],
  flashcardStates: {},
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    studyDates: [],
  },
  weakAreas: [],
  bookmarks: [],
};

type Action =
  | { type: 'LOAD'; payload: UserProgress }
  | { type: 'MARK_SECTION_READ'; topicSlug: string; sectionId: string }
  | { type: 'RECORD_QUIZ'; session: QuizSession }
  | { type: 'UPDATE_FLASHCARD'; cardId: string; result: 'again' | 'hard' | 'good' | 'easy' }
  | { type: 'TOGGLE_BOOKMARK'; questionId: string }
  | { type: 'RESET' };

function progressReducer(state: UserProgress, action: Action): UserProgress {
  switch (action.type) {
    case 'LOAD':
      return action.payload;

    case 'MARK_SECTION_READ': {
      const existing = state.topics[action.topicSlug] || {
        topicSlug: action.topicSlug,
        sectionsRead: [],
        lastVisited: new Date().toISOString(),
        timeSpentMinutes: 0,
      };
      const sectionsRead = existing.sectionsRead.includes(action.sectionId)
        ? existing.sectionsRead
        : [...existing.sectionsRead, action.sectionId];
      return {
        ...state,
        topics: {
          ...state.topics,
          [action.topicSlug]: { ...existing, sectionsRead, lastVisited: new Date().toISOString() },
        },
      };
    }

    case 'RECORD_QUIZ': {
      const wrongQuestions = action.session.attempts
        .filter(a => !a.correct)
        .map(a => a.questionId);

      const existingWeak = new Set(state.weakAreas);
      const attemptCounts: Record<string, number> = {};
      for (const s of state.quizSessions) {
        for (const a of s.attempts) {
          if (!a.correct) attemptCounts[a.questionId] = (attemptCounts[a.questionId] || 0) + 1;
        }
      }
      wrongQuestions.forEach(id => {
        const count = (attemptCounts[id] || 0) + 1;
        if (count >= 2) existingWeak.add(id);
      });

      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const studyDates = state.streak.studyDates.includes(today)
        ? state.streak.studyDates
        : [...state.streak.studyDates, today];

      return {
        ...state,
        quizSessions: [...state.quizSessions, action.session],
        weakAreas: [...existingWeak],
        streak: { ...state.streak, studyDates, lastStudyDate: today },
      };
    }

    case 'UPDATE_FLASHCARD': {
      const existing = state.flashcardStates[action.cardId] || createNewCard(action.cardId);
      const updated = updateFlashcard(existing, action.result);
      return {
        ...state,
        flashcardStates: { ...state.flashcardStates, [action.cardId]: updated },
      };
    }

    case 'TOGGLE_BOOKMARK': {
      const bookmarks = state.bookmarks.includes(action.questionId)
        ? state.bookmarks.filter(b => b !== action.questionId)
        : [...state.bookmarks, action.questionId];
      return { ...state, bookmarks };
    }

    case 'RESET':
      return DEFAULT_PROGRESS;

    default:
      return state;
  }
}

interface ProgressContextType {
  progress: UserProgress;
  markSectionRead: (topicSlug: string, sectionId: string) => void;
  recordQuizSession: (session: QuizSession) => void;
  updateFlashcardResult: (cardId: string, result: 'again' | 'hard' | 'good' | 'easy') => void;
  toggleBookmark: (questionId: string) => void;
  resetProgress: () => void;
  getTopicCompletion: (topicSlug: string, totalSections: number) => number;
  getTopicAccuracy: (topicSlug: string) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, dispatch] = useReducer(progressReducer, DEFAULT_PROGRESS);

  useEffect(() => {
    const saved = getItem<UserProgress>('progress');
    if (saved) dispatch({ type: 'LOAD', payload: saved });
  }, []);

  useEffect(() => {
    setItem('progress', progress);
  }, [progress]);

  const markSectionRead = (topicSlug: string, sectionId: string) =>
    dispatch({ type: 'MARK_SECTION_READ', topicSlug, sectionId });

  const recordQuizSession = (session: QuizSession) =>
    dispatch({ type: 'RECORD_QUIZ', session });

  const updateFlashcardResult = (cardId: string, result: 'again' | 'hard' | 'good' | 'easy') =>
    dispatch({ type: 'UPDATE_FLASHCARD', cardId, result });

  const toggleBookmark = (questionId: string) =>
    dispatch({ type: 'TOGGLE_BOOKMARK', questionId });

  const resetProgress = () => dispatch({ type: 'RESET' });

  const getTopicCompletion = (topicSlug: string, totalSections: number): number => {
    if (totalSections === 0) return 0;
    const topic = progress.topics[topicSlug];
    if (!topic) return 0;
    return Math.round((topic.sectionsRead.length / totalSections) * 100);
  };

  const getTopicAccuracy = (topicSlug: string): number => {
    const sessions = progress.quizSessions.filter(s => s.topicSlug === topicSlug);
    if (sessions.length === 0) return 0;
    const latest = sessions[sessions.length - 1];
    return latest.score;
  };

  return (
    <ProgressContext.Provider value={{
      progress,
      markSectionRead,
      recordQuizSession,
      updateFlashcardResult,
      toggleBookmark,
      resetProgress,
      getTopicCompletion,
      getTopicAccuracy,
    }}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
