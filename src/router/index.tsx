import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '../layouts/RootLayout';
import { Dashboard } from '../pages/Dashboard';
import { TopicIndex } from '../pages/topics/TopicIndex';
import { TopicPage } from '../pages/topics/TopicPage';
import { QuizHome } from '../pages/quiz/QuizHome';
import { QuizSession } from '../pages/quiz/QuizSession';
import { QuizResults } from '../pages/quiz/QuizResults';
import { FlashcardsHome } from '../pages/flashcards/FlashcardsHome';
import { FlashcardsSession } from '../pages/flashcards/FlashcardsSession';
import { ProgressPage } from '../pages/ProgressPage';
import { StudyPlan } from '../pages/StudyPlan';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'study-plan', element: <StudyPlan /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'topics', element: <TopicIndex /> },
      { path: 'topics/:slug', element: <TopicPage /> },
      { path: 'quiz', element: <QuizHome /> },
      { path: 'quiz/session', element: <QuizSession /> },
      { path: 'quiz/results/:sessionId', element: <QuizResults /> },
      { path: 'flashcards', element: <FlashcardsHome /> },
      { path: 'flashcards/session', element: <FlashcardsSession /> },
    ],
  },
], { basename: '/aws-learning' });
