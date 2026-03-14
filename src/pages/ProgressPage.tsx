import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Target, Flame, AlertTriangle, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { allTopics } from '../data/topics';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ROUTES } from '../constants/routes';

export function ProgressPage() {
  const { progress, getTopicCompletion, getTopicAccuracy, resetProgress } = useProgress();
  const totalSessions = progress.quizSessions.length;
  const totalCorrect = progress.quizSessions.reduce((acc, s) => acc + s.attempts.filter(a => a.correct).length, 0);
  const totalAttempted = progress.quizSessions.reduce((acc, s) => acc + s.totalQuestions, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">My <span className="text-gradient">Progress</span></h1>
        <p className="text-gray-400">Track your preparation across all domains</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BarChart3, label: 'Overall Accuracy', value: `${overallAccuracy}%`, color: 'text-aws-orange', bg: 'bg-orange-500/10 border-orange-500/20' },
          { icon: Target, label: 'Quiz Sessions', value: totalSessions, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { icon: Flame, label: 'Day Streak', value: `${progress.streak.currentStreak}d`, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { icon: AlertTriangle, label: 'Weak Areas', value: progress.weakAreas.length, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
            className={`card p-4 border ${stat.bg}`}>
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-5"><TrendingUp className="w-5 h-5 text-aws-orange" /><h2 className="text-lg font-bold text-white">Topic Completion</h2></div>
        <div className="space-y-3">
          {allTopics.map((topic, i) => {
            const ts = topic.subtopics.reduce((acc, st) => acc + st.sections.length, 0);
            const completion = getTopicCompletion(topic.slug, ts);
            const accuracy = getTopicAccuracy(topic.slug);
            return (
              <motion.div key={topic.slug} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.025 }} className="flex items-center gap-4">
                <Link to={ROUTES.TOPIC(topic.slug)} className="w-28 text-xs text-gray-300 hover:text-white transition-colors truncate flex-shrink-0">{topic.shortTitle}</Link>
                <div className="flex-1"><ProgressBar value={completion} color={completion === 100 ? 'green' : 'orange'} size="sm" animated={false} /></div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 w-8 text-right">{completion}%</span>
                  {accuracy > 0 && <span className={`text-xs w-12 text-right font-medium ${accuracy >= 75 ? 'text-green-400' : 'text-red-400'}`}>{accuracy}%</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {progress.quizSessions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-aws-orange" /><h2 className="text-lg font-bold text-white">Quiz History</h2></div>
          <div className="space-y-2">
            {[...progress.quizSessions].reverse().slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-800/50 border border-gray-800">
                <div className="flex items-center gap-3">
                  {session.passed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <div>
                    <div className="text-sm text-white capitalize">{session.mode.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-gray-500">{new Date(session.startedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${session.passed ? 'text-green-400' : 'text-red-400'}`}>{session.score}%</div>
                  <div className="text-xs text-gray-500">{session.attempts.filter(a => a.correct).length}/{session.totalQuestions}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="text-center">
        <button onClick={() => { if (confirm('Reset all progress? This cannot be undone.')) resetProgress(); }}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors">Reset all progress</button>
      </div>
    </div>
  );
}
