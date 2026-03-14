import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ArrowRight, Layers, Shield, Database, Lock, Server, Award } from 'lucide-react';
import { allTopics } from '../data/topics';
import { useProgress } from '../context/ProgressContext';
import { ROUTES } from '../constants/routes';
import { ProgressBar } from '../components/ui/ProgressBar';

const phases = [
  { phase: 1, name: 'Foundation', icon: Layers, color: 'blue', desc: 'Infrastructure, identity, and networking', slugs: ['global-infrastructure', 'iam', 'vpc', 'dns-cdn'] },
  { phase: 2, name: 'Compute & App Tier', icon: Server, color: 'orange', desc: 'EC2, serverless, and containers', slugs: ['compute', 'serverless', 'containers'] },
  { phase: 3, name: 'Data & Storage', icon: Database, color: 'green', desc: 'Storage types and database services', slugs: ['s3', 'block-file-storage', 'databases', 'messaging'] },
  { phase: 4, name: 'Operations & Security', icon: Lock, color: 'red', desc: 'Observability, security, and automation', slugs: ['observability', 'security', 'iac'] },
  { phase: 5, name: 'Enterprise & Migration', icon: Shield, color: 'purple', desc: 'Hybrid networking, migration, analytics', slugs: ['networking', 'migration', 'analytics', 'ml'] },
  { phase: 6, name: 'Mastery', icon: Award, color: 'yellow', desc: 'Well-Architected, cost, disaster recovery', slugs: ['well-architected', 'cost-optimization', 'disaster-recovery'] },
];

const colorMap: Record<string, { border: string; bg: string; text: string }> = {
  blue:   { border: 'border-blue-800/50',   bg: 'bg-blue-900/10',   text: 'text-blue-400' },
  orange: { border: 'border-orange-800/50', bg: 'bg-orange-900/10', text: 'text-aws-orange' },
  green:  { border: 'border-green-800/50',  bg: 'bg-green-900/10',  text: 'text-green-400' },
  red:    { border: 'border-red-800/50',    bg: 'bg-red-900/10',    text: 'text-red-400' },
  purple: { border: 'border-purple-800/50', bg: 'bg-purple-900/10', text: 'text-purple-400' },
  yellow: { border: 'border-yellow-800/50', bg: 'bg-yellow-900/10', text: 'text-yellow-400' },
};

export function StudyPlan() {
  const { getTopicCompletion } = useProgress();
  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Study <span className="text-gradient">Plan</span></h1>
        <p className="text-gray-400">Recommended learning path for AWS SA Professional certification</p>
      </motion.div>
      <div className="space-y-5">
        {phases.map((phase, pi) => {
          const c = colorMap[phase.color];
          const topics = phase.slugs.map(s => allTopics.find(t => t.slug === s)!).filter(Boolean);
          const totalHours = topics.reduce((acc, t) => acc + t.estimatedStudyHours, 0);
          const completed = topics.filter(t => {
            const ts = t.subtopics.reduce((a, st) => a + st.sections.length, 0);
            return getTopicCompletion(t.slug, ts) === 100;
          }).length;
          const pct = Math.round((completed / topics.length) * 100);
          return (
            <motion.div key={phase.phase} initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.1 }}
              className={`rounded-xl border p-5 ${c.border} ${c.bg}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 border ${c.border}`}>
                    <phase.icon className={`w-5 h-5 ${c.text}`} />
                  </div>
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded bg-gray-900 ${c.text}`}>Phase {phase.phase}</span>
                    <h2 className={`font-bold ${c.text} mt-1`}>{phase.name}</h2>
                    <p className="text-gray-400 text-xs">{phase.desc}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="flex items-center gap-1 text-gray-400 text-xs justify-end mb-1">
                    <Clock className="w-3 h-3" /><span>{totalHours}h</span>
                  </div>
                  <div className={`text-base font-bold ${c.text}`}>{pct}%</div>
                </div>
              </div>
              <ProgressBar value={pct} color={phase.color as any} size="sm" className="mb-4" />
              <div className="grid md:grid-cols-2 gap-2">
                {topics.map(topic => {
                  const ts = topic.subtopics.reduce((a, st) => a + st.sections.length, 0);
                  const comp = getTopicCompletion(topic.slug, ts);
                  return (
                    <motion.div key={topic.slug} whileHover={{ scale: 1.01 }}>
                      <Link to={ROUTES.TOPIC(topic.slug)}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-900/70 border border-gray-800 hover:border-gray-700 transition-colors">
                        {comp === 100 ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> :
                         comp > 0 ? <div className="w-4 h-4 rounded-full border-2 border-aws-orange flex items-center justify-center flex-shrink-0"><div className="w-2 h-2 rounded-full bg-aws-orange" /></div> :
                         <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{topic.shortTitle}</div>
                          <div className="text-[10px] text-gray-500">{topic.estimatedStudyHours}h</div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
