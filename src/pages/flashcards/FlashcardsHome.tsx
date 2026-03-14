import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Zap, RotateCcw, ChevronRight, Clock } from 'lucide-react';
import { allDecks } from '../../data/flashcards';
import { useProgress } from '../../context/ProgressContext';
import { isDueToday } from '../../utils/spacedRepetition';
import { ROUTES } from '../../constants/routes';
import { Badge } from '../../components/ui/Badge';

export function FlashcardsHome() {
  const navigate = useNavigate();
  const { progress } = useProgress();

  const decksWithStats = allDecks.map(deck => {
    const due = deck.cards.filter(c => {
      const s = progress.flashcardStates[c.id];
      return !s || isDueToday(s);
    }).length;
    const mastered = deck.cards.filter(c => {
      const s = progress.flashcardStates[c.id];
      return s && s.interval >= 21;
    }).length;
    return { ...deck, due, mastered, total: deck.cards.length };
  });

  const totalDue = decksWithStats.reduce((acc, d) => acc + d.due, 0);
  const totalCards = allDecks.reduce((a, d) => a + d.cards.length, 0);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Flash<span className="text-gradient">cards</span></h1>
        <p className="text-gray-400">Spaced repetition system — study smarter, not harder</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Due Today', value: totalDue, icon: Clock, color: 'text-aws-orange' },
          { label: 'Total Decks', value: allDecks.length, icon: Brain, color: 'text-blue-400' },
          { label: 'Total Cards', value: totalCards, icon: Zap, color: 'text-green-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
            className="card p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* SRS explanation */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="card p-4 mb-6 border-blue-800/40 bg-blue-900/10">
        <div className="flex items-start gap-3">
          <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">Spaced Repetition (SM-2)</p>
            <p className="text-xs text-gray-400">Cards you find easy are shown less often. Hard cards repeat sooner.
              Rate each card: <span className="text-red-400">Again</span> · <span className="text-orange-400">Hard</span> · <span className="text-green-400">Good</span> · <span className="text-blue-400">Easy</span></p>
          </div>
        </div>
      </motion.div>

      {/* Deck list */}
      <div className="space-y-3">
        {decksWithStats.map((deck, i) => (
          <motion.div key={deck.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }}>
            <button onClick={() => navigate(ROUTES.FLASHCARDS_SESSION, { state: { deckId: deck.id } })}
              className="w-full card p-4 flex items-center gap-4 hover:border-gray-700 transition-all text-left group">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-700 transition-colors">
                <Brain className="w-5 h-5 text-aws-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-white">{deck.name}</span>
                  {deck.due > 0 ? <Badge variant="orange" size="sm">{deck.due} due</Badge> : <Badge variant="green" size="sm">Up to date</Badge>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{deck.total} cards</span>
                  <span>{deck.mastered} mastered</span>
                  <div className="flex-1 h-1 bg-gray-800 rounded-full max-w-24">
                    <div className="h-full bg-green-500/60 rounded-full" style={{ width: `${Math.round((deck.mastered / deck.total) * 100)}%` }} />
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
            </button>
          </motion.div>
        ))}
      </div>

      {totalDue > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex justify-center mt-8">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(ROUTES.FLASHCARDS_SESSION, { state: { reviewAll: true } })}
            className="btn-primary flex items-center gap-3 px-8 py-3">
            <RotateCcw className="w-5 h-5" /> Review All Due ({totalDue})
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
