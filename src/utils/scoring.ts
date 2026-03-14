import type { QuizSession } from '../types';

export const PASS_SCORE = 75;

export function calculateScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function isPassing(score: number): boolean {
  return score >= PASS_SCORE;
}

export function getGrade(score: number): { label: string; color: string } {
  if (score >= 90) return { label: 'Excellent', color: 'text-green-400' };
  if (score >= 75) return { label: 'Pass', color: 'text-green-500' };
  if (score >= 60) return { label: 'Near Pass', color: 'text-yellow-400' };
  return { label: 'Needs Work', color: 'text-red-400' };
}

export function getDomainScores(_session: QuizSession): Record<string, { correct: number; total: number }> {
  return {};
}
