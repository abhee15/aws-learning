import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Brain, BookOpen, TrendingUp, Award, Zap,
  CheckCircle2, ArrowRight, Flame,
  BarChart3, AlertTriangle, BookMarked, FileText
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { allTopics } from '../data/topics';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ROUTES } from '../constants/routes';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const domainInfo = [
  { id: 'organizational-complexity', label: 'Organizational Complexity', weight: 26 },
  { id: 'new-solutions', label: 'New Solutions Design', weight: 29 },
  { id: 'migration-modernization', label: 'Migration & Modernization', weight: 25 },
  { id: 'cost-optimization', label: 'Cost Control', weight: 10 },
  { id: 'continuous-improvement', label: 'Continuous Improvement', weight: 10 },
];

export function Dashboard() {
  const { progress, getTopicCompletion } = useProgress();

  const totalSessions = progress.quizSessions.length;
  const avgScore = totalSessions > 0
    ? Math.round(progress.quizSessions.reduce((acc, s) => acc + s.score, 0) / totalSessions)
    : 0;
  const topicsStarted = Object.keys(progress.topics).length;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              AWS SA Professional <span className="text-gradient">Prep Dashboard</span>
            </h1>
            <p className="text-gray-400 text-sm">21 topics · 400+ questions · Visual architecture diagrams</p>
          </div>
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="hidden lg:flex w-12 h-12 rounded-xl bg-orange-gradient items-center justify-center flex-shrink-0"
          >
            <Award className="w-6 h-6 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={containerVariants} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Topics Started', value: `${topicsStarted}/${allTopics.length}`, icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'Quiz Sessions', value: totalSessions, icon: Target, color: 'text-aws-orange', bg: 'bg-orange-500/10 border-orange-500/20' },
          { label: 'Avg Score', value: totalSessions > 0 ? `${avgScore}%` : '—', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Study Streak', value: `${progress.streak.currentStreak}d`, icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map((stat) => (
          <motion.div key={stat.label} variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className={`card p-4 border ${stat.bg} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Domain Coverage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-5 h-5 text-aws-orange" />
              <h2 className="text-lg font-bold text-white">Exam Domain Coverage</h2>
            </div>
            <div className="space-y-4">
              {domainInfo.map((domain, i) => {
                const topicsInDomain = allTopics.filter(t => t.examDomains.includes(domain.id as any));
                const started = topicsInDomain.filter(t => progress.topics[t.slug]);
                const pct = topicsInDomain.length > 0 ? Math.round((started.length / topicsInDomain.length) * 100) : 0;
                return (
                  <motion.div key={domain.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-gray-300">{domain.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{domain.weight}% of exam</span>
                        <span className="text-xs font-bold text-aws-orange">{pct}%</span>
                      </div>
                    </div>
                    <ProgressBar value={pct} color="orange" size="sm" animated />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Topic Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-aws-orange" />
                <h2 className="text-lg font-bold text-white">Topic Progress</h2>
              </div>
              <Link to={ROUTES.TOPICS} className="text-xs text-aws-orange hover:text-orange-400 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {allTopics.map((topic, i) => {
                const totalSec = topic.subtopics.reduce((acc, st) => acc + st.sections.length, 0);
                const completion = getTopicCompletion(topic.slug, totalSec);
                return (
                  <motion.div key={topic.slug} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.02 }} whileHover={{ scale: 1.03 }}>
                    <Link to={ROUTES.TOPIC(topic.slug)}
                      className={`block p-2.5 rounded-xl border transition-colors ${completion === 100 ? 'bg-green-900/20 border-green-800/50' : completion > 0 ? 'bg-gray-900 border-gray-800' : 'bg-gray-900/50 border-gray-800/50'} hover:border-gray-700`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-gray-300 truncate">{topic.shortTitle}</span>
                        {completion === 100 ? <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" /> : completion > 0 ? <span className="text-[10px] text-aws-orange">{completion}%</span> : null}
                      </div>
                      <ProgressBar value={completion} color={completion === 100 ? 'green' : 'orange'} size="sm" animated={false} />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-aws-orange" />
              <h2 className="font-bold text-white">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { to: ROUTES.TOPICS, icon: BookOpen, label: 'Study Topics', desc: 'Visual learning + diagrams' },
                { to: ROUTES.QUIZ, icon: Target, label: 'Practice Quiz', desc: '400+ exam questions' },
                { to: ROUTES.FLASHCARDS, icon: Brain, label: 'Flashcards', desc: 'Spaced repetition' },
                { to: ROUTES.PROGRESS, icon: TrendingUp, label: 'My Progress', desc: 'Analytics + weak areas' },
              ].map((item) => (
                <motion.div key={item.to} whileHover={{ x: 4 }} transition={{ duration: 0.15 }}>
                  <Link to={item.to} className="flex items-center gap-3 p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-aws-orange" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-600" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Exam Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-aws-orange" />
              <h2 className="font-bold text-white">Exam Details</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Duration', value: '180 minutes' },
                { label: 'Questions', value: '75 questions' },
                { label: 'Pass Score', value: '750/1000 (75%)' },
                { label: 'Format', value: 'Multiple choice/select' },
                { label: 'Exam Code', value: 'SAP-C02' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-xs font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weak Areas */}
          {progress.weakAreas.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="card p-5 border-yellow-800/40">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-white text-sm">Weak Areas</span>
                <span className="ml-auto text-xs text-yellow-400">{progress.weakAreas.length}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">Questions missed 2+ times</p>
              <Link to={`${ROUTES.QUIZ}?mode=weak-areas`} className="btn-primary w-full text-center text-sm block py-2">
                Retry Weak Areas
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
