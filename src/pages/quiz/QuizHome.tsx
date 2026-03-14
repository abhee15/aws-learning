import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Timer, Zap, BookOpen, AlertTriangle, ArrowRight, CheckCircle, BarChart3, Award } from 'lucide-react';
import { allTopics } from '../../data/topics';
import { allQuestions } from '../../data/questions';
import { useProgress } from '../../context/ProgressContext';
import { shuffle, pickRandom } from '../../utils/shuffle';
import { ROUTES } from '../../constants/routes';
import { Badge } from '../../components/ui/Badge';

const MODES = [
  { id: 'topic', title: 'Topic Quiz', desc: 'Focus on one topic area', icon: BookOpen, color: 'border-blue-800/50 bg-blue-900/10', iconColor: 'text-blue-400' },
  { id: 'full-exam', title: 'Full Practice Exam', desc: '75 questions, 180 minutes', icon: Award, color: 'border-orange-800/50 bg-orange-900/10', iconColor: 'text-aws-orange', count: 75 },
  { id: 'timed-exam', title: 'Timed Exam Simulation', desc: 'Strict timer, exam conditions', icon: Timer, color: 'border-red-800/50 bg-red-900/10', iconColor: 'text-red-400', count: 75 },
  { id: 'weak-areas', title: 'Weak Areas Review', desc: 'Questions you have missed before', icon: AlertTriangle, color: 'border-yellow-800/50 bg-yellow-900/10', iconColor: 'text-yellow-400' },
  { id: 'quick', title: 'Quick Practice', desc: '15 random questions, no timer', icon: Zap, color: 'border-green-800/50 bg-green-900/10', iconColor: 'text-green-400', count: 15 },
];

export function QuizHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { progress } = useProgress();
  const [selectedMode, setSelectedMode] = useState('topic');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [questionCount, setQuestionCount] = useState(20);
  const weakAreaQuestions = allQuestions.filter(q => progress.weakAreas.includes(q.id));

  const handleStart = () => {
    let questions: typeof allQuestions = [];
    let mode = selectedMode as any;
    if (selectedMode === 'topic' && selectedTopic) {
      const pool = allQuestions.filter(q => q.topicSlug === selectedTopic);
      questions = pickRandom(pool, Math.min(questionCount, pool.length));
    } else if (selectedMode === 'full-exam' || selectedMode === 'timed-exam') {
      questions = pickRandom(allQuestions, 75);
    } else if (selectedMode === 'weak-areas') {
      questions = shuffle(weakAreaQuestions).slice(0, 30);
    } else if (selectedMode === 'quick') {
      questions = pickRandom(allQuestions, 15);
      mode = 'topic';
    }
    if (!questions.length) return;
    navigate(ROUTES.QUIZ_SESSION, { state: { questions, mode, topicSlug: selectedTopic || undefined, timed: selectedMode === 'timed-exam', timeLimit: 180 * 60 } });
  };

  const canStart = () => {
    if (selectedMode === 'topic') return !!selectedTopic;
    if (selectedMode === 'weak-areas') return weakAreaQuestions.length > 0;
    return true;
  };

  const qByTopic = allTopics.map(t => ({ topic: t, count: allQuestions.filter(q => q.topicSlug === t.slug).length }));

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Practice <span className="text-gradient">Quiz</span></h1>
        <p className="text-gray-400">{allQuestions.length} questions covering all SA Professional exam domains</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Total Questions', value: allQuestions.length, icon: Target, color: 'text-aws-orange' },
          { label: 'Sessions Taken', value: progress.quizSessions.length, icon: BarChart3, color: 'text-blue-400' },
          { label: 'Weak Areas', value: progress.weakAreas.length, icon: AlertTriangle, color: 'text-yellow-400' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }} className="card p-4 text-center">
            <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
            <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Mode</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODES.map((mode, i) => (
            <motion.button key={mode.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${selectedMode === mode.id ? 'border-aws-orange ring-1 ring-aws-orange/30 bg-orange-900/15' : `${mode.color} hover:border-opacity-80`}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedMode === mode.id ? 'bg-aws-orange/20' : 'bg-gray-800'}`}>
                <mode.icon className={`w-5 h-5 ${selectedMode === mode.id ? 'text-aws-orange' : mode.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{mode.title}</span>
                  {(mode as any).count && <Badge variant="orange" size="sm">{(mode as any).count}Q</Badge>}
                  {mode.id === 'weak-areas' && weakAreaQuestions.length > 0 && <Badge variant="yellow" size="sm">{weakAreaQuestions.length}</Badge>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{mode.desc}</p>
              </div>
              {selectedMode === mode.id && <CheckCircle className="w-5 h-5 text-aws-orange flex-shrink-0" />}
            </motion.button>
          ))}
        </div>
      </div>

      {selectedMode === 'topic' && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Select Topic</p>
          <div className="card p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {qByTopic.filter(({ count }) => count > 0).map(({ topic, count }) => (
                <button key={topic.slug} onClick={() => setSelectedTopic(topic.slug)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-left border transition-colors ${selectedTopic === topic.slug ? 'border-aws-orange bg-aws-orange/10 text-aws-orange' : 'border-gray-800 bg-gray-800/50 text-gray-300 hover:border-gray-700'}`}>
                  <span className="text-xs truncate">{topic.shortTitle}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-1">{count}Q</span>
                </button>
              ))}
            </div>
            {selectedTopic && (
              <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
                <label className="text-xs text-gray-400">Questions:</label>
                <div className="flex gap-2">
                  {[10, 15, 20, 25].map(n => (
                    <button key={n} onClick={() => setQuestionCount(n)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${questionCount === n ? 'border-aws-orange bg-aws-orange/20 text-aws-orange' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>{n}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex justify-center">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleStart} disabled={!canStart()}
          className="btn-primary flex items-center gap-3 px-8 py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed">
          <Target className="w-5 h-5" /> Start Quiz <ArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
      {selectedMode === 'weak-areas' && !weakAreaQuestions.length && (
        <p className="text-center text-xs text-gray-500 mt-3">No weak areas yet — take some quizzes first.</p>
      )}
    </div>
  );
}
