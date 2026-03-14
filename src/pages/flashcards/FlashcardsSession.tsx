import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle, RotateCcw } from 'lucide-react';
import { allDecks } from '../../data/flashcards';
import { useProgress } from '../../context/ProgressContext';
import { isDueToday } from '../../utils/spacedRepetition';
import { ROUTES } from '../../constants/routes';

type Rating = 'again' | 'hard' | 'good' | 'easy';

const RATINGS: { label: string; value: Rating; color: string }[] = [
  { label: 'Again', value: 'again', color: 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' },
  { label: 'Hard',  value: 'hard',  color: 'bg-orange-500/20 border-orange-500/40 text-orange-400 hover:bg-orange-500/30' },
  { label: 'Good',  value: 'good',  color: 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30' },
  { label: 'Easy',  value: 'easy',  color: 'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30' },
];

export function FlashcardsSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { progress, updateFlashcardResult } = useProgress();
  const { deckId, reviewAll } = (location.state ?? {}) as { deckId?: string; reviewAll?: boolean };

  const cards = useMemo(() => {
    const pool = reviewAll
      ? allDecks.flatMap(d => d.cards)
      : (allDecks.find(d => d.id === deckId)?.cards ?? []);
    return pool.filter(c => {
      const s = progress.flashcardStates[c.id];
      return !s || isDueToday(s);
    });
  }, [deckId, reviewAll]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  if (!cards.length) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">All caught up!</h2>
        <p className="text-gray-400 mb-6 text-sm">No cards due today. Check back tomorrow.</p>
        <button onClick={() => navigate(ROUTES.FLASHCARDS)} className="btn-primary px-6 py-2.5">Back to Decks</button>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center">
        <CheckCircle className="w-12 h-12 text-aws-orange mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Session Complete</h2>
        <p className="text-gray-400 mb-6 text-sm">{reviewed} cards reviewed</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(ROUTES.FLASHCARDS)}
            className="px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-600 text-sm transition-colors">
            Back to Decks
          </button>
          <button onClick={() => { setIndex(0); setFlipped(false); setReviewed(0); }}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
            <RotateCcw className="w-4 h-4" /> Study Again
          </button>
        </div>
      </div>
    );
  }

  const card = cards[index];

  const rate = (rating: Rating) => {
    updateFlashcardResult(card.id, rating);
    setReviewed(r => r + 1);
    setIndex(i => i + 1);
    setFlipped(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(ROUTES.FLASHCARDS)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors">
          <ChevronLeft className="w-4 h-4" /> Decks
        </button>
        <span className="text-sm text-gray-500">{index + 1} / {cards.length}</span>
      </div>

      <div className="h-1 bg-gray-800 rounded-full mb-8">
        <motion.div className="h-full bg-aws-orange rounded-full"
          animate={{ width: `${(index / cards.length) * 100}%` }} />
      </div>

      {/* Flip card */}
      <div className="mb-6" style={{ perspective: 1200 }}>
        <AnimatePresence mode="wait">
          <motion.div key={card.id + (flipped ? '-back' : '-front')}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="card p-8 min-h-48 flex flex-col items-center justify-center text-center cursor-pointer select-none"
            onClick={() => !flipped && setFlipped(true)}>
            {!flipped ? (
              <div>
                <p className="text-xs text-aws-orange font-semibold uppercase tracking-wider mb-4">Question — tap to reveal</p>
                <p className="text-white text-lg leading-relaxed">{card.front}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-4">Answer</p>
                <p className="text-white text-base leading-relaxed">{card.back}</p>
                {card.hint && <p className="text-xs text-gray-500 mt-3 italic">{card.hint}</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-gray-500 text-center mb-3">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map(r => (
                <motion.button key={r.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => rate(r.value)}
                  className={`py-3 rounded-xl border font-semibold text-sm transition-all ${r.color}`}>
                  {r.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-center text-xs text-gray-600 mt-4">Tap the card to reveal the answer</p>
      )}
    </div>
  );
}
