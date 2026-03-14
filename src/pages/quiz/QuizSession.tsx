import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Clock, Flag, AlertCircle } from 'lucide-react';
import type { Question } from '../../types/question';
import type { QuizAttempt } from '../../types/progress';
import { useProgress } from '../../context/ProgressContext';
import { calculateScore, isPassing } from '../../utils/scoring';
import { ROUTES } from '../../constants/routes';
import { Badge } from '../../components/ui/Badge';

interface LocationState {
  questions: Question[];
  mode: string;
  topicSlug?: string;
  timed?: boolean;
  timeLimit?: number;
}

export function QuizSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const { recordQuizSession } = useProgress();
  const state = location.state as LocationState;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [timeLeft, setTimeLeft] = useState(state?.timeLimit ?? 0);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const startedAt = useRef(new Date().toISOString());
  const questionStart = useRef(Date.now());

  useEffect(() => {
    if (!state?.questions?.length) navigate(ROUTES.QUIZ);
  }, [state, navigate]);

  const finish = useCallback((finalAttempts: QuizAttempt[]) => {
    const total = questions.length;
    const correct = finalAttempts.filter(a => a.correct).length;
    const score = calculateScore(correct, total);
    const sessionId = crypto.randomUUID();
    const sessionMode = state.mode as 'topic' | 'full-exam' | 'weak-areas' | 'timed-exam';
    recordQuizSession({
      id: sessionId,
      mode: sessionMode,
      topicSlug: state.topicSlug,
      startedAt: startedAt.current,
      completedAt: new Date().toISOString(),
      totalQuestions: total,
      score,
      passed: isPassing(score),
      attempts: finalAttempts,
    });
    navigate(ROUTES.QUIZ_RESULTS(sessionId), {
      state: { questions, attempts: finalAttempts, score, passed: isPassing(score), mode: state.mode }
    });
  }, [state, recordQuizSession, navigate]);

  useEffect(() => {
    if (!state?.timed || !timeLeft) return;
    const id = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(id); finish(attempts); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [state?.timed]);

  const questions = state?.questions ?? [];
  const q = questions[current];
  if (!q) return null;

  const isMultiple = q.type === 'multiple';
  const correctIds = q.options.filter(o => o.correct).map(o => o.id);

  const toggleOption = (id: string) => {
    if (revealed) return;
    if (isMultiple) {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setSelected([id]);
    }
  };

  const handleReveal = () => {
    if (!selected.length) return;
    setRevealed(true);
  };

  const handleNext = () => {
    const isCorrect = selected.length === correctIds.length && selected.every(s => correctIds.includes(s));
    const newAttempt: QuizAttempt = {
      questionId: q.id,
      selectedAnswers: selected,
      correct: isCorrect,
      timeSpentSeconds: Math.round((Date.now() - questionStart.current) / 1000),
    };
    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);
    if (current + 1 >= questions.length) {
      finish(newAttempts);
    } else {
      setCurrent(c => c + 1);
      setSelected([]);
      setRevealed(false);
      questionStart.current = Date.now();
    }
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{current + 1} / {questions.length}</span>
          {flagged.has(current) && <Flag className="w-4 h-4 text-yellow-400" />}
        </div>
        <div className="flex items-center gap-3">
          {state?.timed && (
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-gray-300'}`}>
              <Clock className="w-4 h-4" />{formatTime(timeLeft)}
            </div>
          )}
          <button
            onClick={() => setFlagged(prev => { const s = new Set(prev); s.has(current) ? s.delete(current) : s.add(current); return s; })}
            className={`p-1.5 rounded-lg transition-colors ${flagged.has(current) ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-600 hover:text-gray-400'}`}>
            <Flag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-gray-800 rounded-full mb-6">
        <motion.div className="h-full bg-aws-orange rounded-full"
          animate={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={current}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

          {/* Question */}
          <div className="card p-6 mb-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="orange" size="sm">{q.examDomain.replace(/-/g, ' ')}</Badge>
              <Badge variant={q.difficulty === 1 ? 'green' : q.difficulty === 2 ? 'yellow' : 'red'} size="sm">
                {['', 'Easy', 'Medium', 'Hard'][q.difficulty]}
              </Badge>
              {isMultiple && <Badge variant="blue" size="sm">Multiple Answer</Badge>}
            </div>
            <p className="text-white leading-relaxed">{q.stem}</p>
            {isMultiple && (
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />Select {correctIds.length} answers
              </p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {q.options.map(opt => {
              const isSelected = selected.includes(opt.id);
              const isCorrect = opt.correct;
              let cls = 'border-gray-800 bg-gray-900/50 hover:border-gray-700';
              if (revealed) {
                if (isCorrect) cls = 'border-green-500/60 bg-green-900/20';
                else if (isSelected) cls = 'border-red-500/60 bg-red-900/20';
              } else if (isSelected) {
                cls = 'border-aws-orange bg-aws-orange/10';
              }
              return (
                <motion.button key={opt.id}
                  whileHover={!revealed ? { scale: 1.005 } : {}}
                  whileTap={!revealed ? { scale: 0.995 } : {}}
                  onClick={() => toggleOption(opt.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${cls} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
                    ${revealed && isCorrect ? 'border-green-400 bg-green-400' : revealed && isSelected && !isCorrect ? 'border-red-400 bg-red-400' : isSelected ? 'border-aws-orange bg-aws-orange' : 'border-gray-600'}`}>
                    {revealed && isCorrect && <CheckCircle className="w-3 h-3 text-white" />}
                    {revealed && isSelected && !isCorrect && <XCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-200">{opt.text}</span>
                    {revealed && opt.explanation && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-xs text-gray-400 mt-2 leading-relaxed">{opt.explanation}</motion.p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          {revealed && q.explanation && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="card p-5 mb-4 border-blue-800/40 bg-blue-900/10">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Explanation</p>
              <p className="text-sm text-gray-300 leading-relaxed">{q.explanation.overall}</p>
              {q.explanation.examTip && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
                  <p className="text-xs font-semibold text-yellow-400 mb-1">Exam Tip</p>
                  <p className="text-xs text-gray-300">{q.explanation.examTip}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            {!revealed ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleReveal} disabled={!selected.length}
                className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">
                Check Answer
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="btn-primary flex items-center gap-2 px-6 py-2.5">
                {current + 1 >= questions.length ? 'Finish Quiz' : 'Next Question'}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
