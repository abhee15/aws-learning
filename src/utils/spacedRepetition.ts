import type { FlashcardState } from '../types';

type Rating = 'again' | 'hard' | 'good' | 'easy';

const RATING_SCORES: Record<Rating, number> = {
  again: 0,
  hard: 2,
  good: 3,
  easy: 5,
};

export function updateFlashcard(card: FlashcardState, rating: Rating): FlashcardState {
  const score = RATING_SCORES[rating];
  let { easeFactor, interval, repetitions } = card;

  if (score < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastResult: rating,
  };
}

export function isDueToday(card: FlashcardState): boolean {
  return new Date(card.nextReviewDate) <= new Date();
}

export function createNewCard(cardId: string): FlashcardState {
  return {
    cardId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastResult: 'good',
  };
}
