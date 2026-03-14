import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronDown, RotateCcw, Home, Trophy, Target, TrendingUp } from 'lucide-react';
import type { Question } from '../../types/question';
import type { QuizAttempt } from '../../types/progress';
import { ROUTES } from '../../constants/routes';
import { Badge } from '../../components/ui/Badge';

interface LocationState {
  questions: Question[];
  attempts: QuizAttempt[];
  score: number;
  passed: boolean;
  mode: string;
}

export function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!state?.questions) { navigate(ROUTES.QUIZ); return null; }

  const { questions, attempts, score, passed, mode } = state;
  const correct = attempts.filter(a => a.correct).length;

  const getGradeColor = (s: number) => s >= 80 ? 'text-green-400' : s >= 65 ? 'text-yellow-400' : 'text-red-400';
  const getGradeBg = (s: number) => s >= 80 ? 'border-green-800/40 bg-green-900/10' : s >= 65 ? 'border-yellow-800/40 bg-yellow-900/10' : 'border-red-800/40 bg-red-900/10';

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Score card */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className={`card p-8 mb-8 text-center border ${getGradeBg(score)}`}>
        <div className="flex justify-center mb-4">
          {passed ? <Trophy className="w-12 h-12 text-aws-orange" /> : <Target className="w-12 h-12 text-red-400" />}
        </div>
        <div className={`text-6xl font-black mb-2 ${getGradeColor(score)}`}>{score}%</div>
        <div className={`text-lg font-semibold mb-1 ${passed ? 'text-green-400' : 'text-red-400'}`}>
          {passed ? 'Pass' : 'Not yet — keep studying'}
        </div>
        <p className="text-gray-400 text-sm">{correct} of {questions.length} correct · {mode.replace(/-/g, ' ')} mode</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Correct', value: correct, icon: CheckCircle2, color: 'text-green-400' },
          { label: 'Incorrect', value: questions.length - correct, icon: XCircle, color: 'text-red-400' },
          { label: 'Score', value: `${score}%`, icon: TrendingUp, color: getGradeColor(score) },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
            className="card p-4 text-center">
            <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Answer review */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Answer Review</p>
        <div className="space-y-2">
          {questions.map((q, i) => {
            const attempt = attempts.find(a => a.questionId === q.id);
            const isCorrect = attempt?.correct ?? false;
            const isOpen = expanded === q.id;
            const correctOpts = q.options.filter(o => o.correct);
            const selectedOpts = q.options.filter(o => attempt?.selectedAnswers.includes(o.id));
            return (
              <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.02 }}
                className={`rounded-xl border overflow-hidden ${isCorrect ? 'border-green-800/40' : 'border-red-800/40'}`}>
                <button onClick={() => setExpanded(isOpen ? null : q.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${isCorrect ? 'bg-green-900/10 hover:bg-green-900/15' : 'bg-red-900/10 hover:bg-red-900/15'}`}>
                  {isCorrect
                    ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                  <span className="flex-1 text-sm text-white line-clamp-2">{q.stem}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={q.difficulty === 1 ? 'green' : q.difficulty === 2 ? 'yellow' : 'red'} size="sm">
                      {['', 'Easy', 'Med', 'Hard'][q.difficulty]}
                    </Badge>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-800 bg-gray-900/50 p-4 space-y-3 overflow-hidden">
                      {!isCorrect && selectedOpts.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Your answer</p>
                          {selectedOpts.map(o => <p key={o.id} className="text-sm text-red-400">{o.text}</p>)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Correct answer</p>
                        {correctOpts.map(o => <p key={o.id} className="text-sm text-green-400">{o.text}</p>)}
                      </div>
                      {q.explanation?.overall && (
                        <div className="pt-2 border-t border-gray-800">
                          <p className="text-xs text-gray-400 leading-relaxed">{q.explanation.overall}</p>
                          {q.explanation.examTip && (
                            <div className="mt-2 p-2.5 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
                              <p className="text-xs font-semibold text-yellow-400 mb-0.5">Exam Tip</p>
                              <p className="text-xs text-gray-300">{q.explanation.examTip}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="flex gap-3 mt-8 justify-center">
        <button onClick={() => navigate(ROUTES.QUIZ)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition-colors text-sm">
          <Home className="w-4 h-4" /> Quiz Home
        </button>
        <button onClick={() => navigate(ROUTES.QUIZ)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </motion.div>
    </div>
  );
}
