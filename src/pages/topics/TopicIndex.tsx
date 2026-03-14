import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Clock, Target, CheckCircle2, BookOpen } from 'lucide-react';
import { allTopics } from '../../data/topics';
import { useProgress } from '../../context/ProgressContext';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../constants/routes';

const domainColors: Record<string, any> = {
  'organizational-complexity': 'purple',
  'new-solutions': 'blue',
  'migration-modernization': 'yellow',
  'cost-optimization': 'green',
  'continuous-improvement': 'orange',
};

const domainLabels: Record<string, string> = {
  'organizational-complexity': 'Org Complexity',
  'new-solutions': 'New Solutions',
  'migration-modernization': 'Migration',
  'cost-optimization': 'Cost',
  'continuous-improvement': 'Improvement',
};

export function TopicIndex() {
  const [search, setSearch] = useState('');
  const { getTopicCompletion, getTopicAccuracy } = useProgress();
  const filtered = allTopics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.shortTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Study <span className="text-gradient">Topics</span></h1>
        <p className="text-gray-400">21 comprehensive topics covering all AWS SA Professional exam domains</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search topics..." value={search}
            onChange={e => setSearch(e.target.value)} className="input w-full pl-9" />
        </div>
      </motion.div>

      <motion.div
        initial="hidden" animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {filtered.map((topic) => {
          const totalSec = topic.subtopics.reduce((acc, st) => acc + st.sections.length, 0);
          const completion = getTopicCompletion(topic.slug, totalSec);
          const accuracy = getTopicAccuracy(topic.slug);
          return (
            <motion.div key={topic.slug}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ y: -3 }}>
              <Link to={ROUTES.TOPIC(topic.slug)}
                className="block p-5 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-aws-orange" />
                  </div>
                  <div className="text-right">
                    {completion === 100 ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : completion > 0 ? (
                      <span className="text-xs font-bold text-aws-orange">{completion}%</span>
                    ) : null}
                    {accuracy > 0 && <div className="text-[10px] text-yellow-400 mt-0.5">{accuracy}% quiz</div>}
                  </div>
                </div>
                <h3 className="text-white font-bold text-sm mb-2 leading-snug">{topic.title}</h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Clock className="w-3 h-3" /><span>{topic.estimatedStudyHours}h</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs">
                    <Target className="w-3 h-3" /><span>{totalSec} sections</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {topic.examDomains.slice(0, 2).map(d => (
                    <Badge key={d} variant={domainColors[d]} size="sm">{domainLabels[d]}</Badge>
                  ))}
                </div>
                <ProgressBar value={completion} color={completion === 100 ? 'green' : 'orange'} size="sm" animated={false} />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
