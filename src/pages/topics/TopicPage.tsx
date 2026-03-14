import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, BarChart3, Zap, Brain,
  CheckCircle2, AlertTriangle, Lightbulb, GitBranch, Target,
  Clock, List, Star, BookMarked
} from 'lucide-react';
import { getTopicBySlug, allTopics } from '../../data/topics';
import { useProgress } from '../../context/ProgressContext';
import { Tabs } from '../../components/ui/Tabs';
import { Accordion } from '../../components/ui/Accordion';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ROUTES } from '../../constants/routes';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'concepts', label: 'Concepts', icon: <Brain className="w-4 h-4" /> },
  { id: 'diagrams', label: 'Diagrams', icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'compare', label: 'Compare', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'usecases', label: 'Use Cases', icon: <Target className="w-4 h-4" /> },
  { id: 'mnemonics', label: 'Memory Aids', icon: <Zap className="w-4 h-4" /> },
];

function renderInline(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-aws-orange px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
}

function renderParagraph(para: string, pi: number) {
  const lines = para.split('\n');
  type Seg = { type: 'text' | 'list'; content: string[] };
  const segments: Seg[] = [];

  for (const line of lines) {
    if (line.startsWith('- ')) {
      if (segments.length && segments[segments.length - 1].type === 'list') {
        segments[segments.length - 1].content.push(line.slice(2));
      } else {
        segments.push({ type: 'list', content: [line.slice(2)] });
      }
    } else {
      if (segments.length && segments[segments.length - 1].type === 'text') {
        segments[segments.length - 1].content.push(line);
      } else {
        segments.push({ type: 'text', content: [line] });
      }
    }
  }

  return (
    <div key={pi} className="space-y-1.5">
      {segments.map((seg, si) =>
        seg.type === 'list' ? (
          <ul key={si} className="space-y-1.5 mt-1">
            {seg.content.map((item, ii) => (
              <li key={ii} className="flex items-start gap-2.5">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-aws-orange/60 flex-shrink-0" />
                <span className="text-sm text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={si} className="text-sm text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderInline(seg.content.join('\n')) }} />
        )
      )}
    </div>
  );
}

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = getTopicBySlug(slug || '');
  const { markSectionRead, getTopicCompletion, progress } = useProgress();
  const [activeTab, setActiveTab] = useState('overview');
  const [DiagramComponents, setDiagramComponents] = useState<React.ComponentType[]>([]);

  React.useEffect(() => {
    if (activeTab !== 'diagrams') return;
    const load = async () => {
      const components: React.ComponentType[] = [];
      if (slug === 'vpc') {
        const { VpcDiagram } = await import('../../components/diagrams/VpcDiagram');
        const { TransitGatewayDiagram } = await import('../../components/diagrams/TransitGatewayDiagram');
        components.push(VpcDiagram, TransitGatewayDiagram);
      } else if (slug === 'iam') {
        const { IamPolicyDiagram } = await import('../../components/diagrams/IamPolicyDiagram');
        components.push(IamPolicyDiagram);
      } else if (slug === 'disaster-recovery') {
        const { DisasterRecoveryDiagram } = await import('../../components/diagrams/DisasterRecoveryDiagram');
        components.push(DisasterRecoveryDiagram);
      } else if (slug === 'serverless') {
        const { ServerlessArchDiagram } = await import('../../components/diagrams/ServerlessArchDiagram');
        components.push(ServerlessArchDiagram);
      } else if (slug === 'well-architected') {
        const { WellArchDiagram } = await import('../../components/diagrams/WellArchDiagram');
        components.push(WellArchDiagram);
      }
      setDiagramComponents(components);
    };
    load();
  }, [activeTab, slug]);

  if (!topic) return <Navigate to={ROUTES.TOPICS} replace />;

  const topicIndex = allTopics.findIndex(t => t.slug === topic.slug);
  const prevTopic = topicIndex > 0 ? allTopics[topicIndex - 1] : null;
  const nextTopic = topicIndex < allTopics.length - 1 ? allTopics[topicIndex + 1] : null;
  const totalSections = topic.subtopics.reduce((acc, st) => acc + st.sections.length, 0);
  const completion = getTopicCompletion(topic.slug, totalSections);
  const readSections = progress.topics[topic.slug]?.sectionsRead || [];
  const allSections = topic.subtopics.flatMap(st => st.sections);
  const allComparisons = allSections.flatMap(s => s.comparisons || []);
  const allUseCases = allSections.flatMap(s => s.useCases || []);
  const allMnemonics = allSections.flatMap(s => s.mnemonics || []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 border-b border-gray-800 px-5 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Link to={ROUTES.TOPICS} className="hover:text-gray-300 flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Topics
          </Link>
          <span>/</span>
          <span className="text-gray-300">{topic.title}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white mb-2">{topic.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><Clock className="w-3.5 h-3.5" />{topic.estimatedStudyHours}h</div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400"><List className="w-3.5 h-3.5" />{totalSections} sections</div>
              <div className="flex items-center gap-1.5 text-xs text-aws-orange font-medium">{completion}% complete</div>
            </div>
            <ProgressBar value={completion} color="orange" size="sm" className="max-w-xs" />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-gray-900/60 border-b border-gray-800 px-4 sticky top-14 z-10 backdrop-blur-sm">
        <Tabs tabs={TABS.map(t => ({
          ...t,
          count: t.id === 'compare' ? allComparisons.length || undefined :
                 t.id === 'usecases' ? allUseCases.length || undefined :
                 t.id === 'mnemonics' ? allMnemonics.length || undefined : undefined,
        }))} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-aws-orange" />
                    <h2 className="text-lg font-bold text-white">Key Takeaways</h2>
                  </div>
                  <ul className="space-y-3">
                    {topic.summaryBullets.map((bullet, i) => (
                      <motion.li key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-aws-orange/15 border border-aws-orange/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-aws-orange">{i + 1}</span>
                        <span className="text-gray-300 text-sm leading-relaxed">{bullet}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookMarked className="w-5 h-5 text-blue-400" />
                    <h2 className="text-lg font-bold text-white">Topics Covered</h2>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {topic.subtopics.map((st, i) => (
                      <motion.div key={st.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40 border border-gray-800">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{st.title}</div>
                          <div className="text-xs text-gray-500">{st.sections.length} sections</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-bold text-white">Exam Tips &amp; Gotchas</h2>
                  </div>
                  <div className="space-y-2">
                    {allSections.flatMap(s => s.keyPoints).map((kp, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${kp.gotcha ? 'bg-red-900/10 border-red-800/40' : kp.examTip ? 'bg-yellow-900/10 border-yellow-800/30' : 'bg-gray-800/30 border-gray-800'}`}>
                        {kp.gotcha ? <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" /> :
                         kp.examTip ? <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" /> :
                         <CheckCircle2 className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />}
                        <span className="text-sm text-gray-200 flex-1">{kp.text}</span>
                        {kp.gotcha && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">GOTCHA</span>}
                        {kp.examTip && !kp.gotcha && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">TIP</span>}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CONCEPTS */}
            {activeTab === 'concepts' && (
              <div className="space-y-6">
                {topic.subtopics.map((subtopic, si) => (
                  <motion.div key={subtopic.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-aws-orange/10 border border-aws-orange/20 flex items-center justify-center">
                        <span className="text-aws-orange text-xs font-bold">{si + 1}</span>
                      </div>
                      <h2 className="font-bold text-white">{subtopic.title}</h2>
                    </div>
                    <Accordion allowMultiple items={subtopic.sections.map(section => ({
                      id: section.id,
                      title: section.title,
                      badge: readSections.includes(section.id) ? 'Read' : undefined,
                      content: (
                        <div className="mt-3">
                          <div className="space-y-3 mb-4">
                            {section.content.split('\n\n').map((para, pi) => renderParagraph(para, pi))}
                          </div>
                          {section.keyPoints.length > 0 && (
                            <div className="mb-4 space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Key Points</p>
                              {section.keyPoints.map((kp, ki) => (
                                <div key={ki} className={`flex items-start gap-2 p-2.5 rounded-lg border ${kp.gotcha ? 'bg-red-900/15 border-red-800/30' : kp.examTip ? 'bg-yellow-900/10 border-yellow-800/25' : 'bg-gray-800/30 border-gray-800'}`}>
                                  {kp.gotcha ? <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" /> :
                                   kp.examTip ? <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" /> :
                                   <CheckCircle2 className="w-3.5 h-3.5 text-gray-600 flex-shrink-0 mt-0.5" />}
                                  <span className="text-xs text-gray-300 flex-1">{kp.text}</span>
                                  {kp.gotcha && <span className="text-[9px] bg-red-500/20 text-red-400 px-1 rounded font-bold flex-shrink-0">GOTCHA</span>}
                                  {kp.examTip && !kp.gotcha && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1 rounded font-bold flex-shrink-0">TIP</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {section.comparisons?.map((comp, ci) => (
                            <div key={ci} className="mb-4 overflow-x-auto">
                              <table className="w-full text-xs border border-gray-800 rounded-lg overflow-hidden">
                                <thead><tr className="bg-gray-800">{comp.headers.map((h, hi) => <th key={hi} className="px-3 py-2 text-left text-gray-400 font-semibold">{h}</th>)}</tr></thead>
                                <tbody>{comp.rows.map((row, ri) => <tr key={ri} className="border-t border-gray-800 hover:bg-gray-800/30">{row.map((cell, ci2) => <td key={ci2} className={`px-3 py-2 ${ci2 === 0 ? 'font-medium text-white' : 'text-gray-400'}`}>{cell}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          ))}
                          <button onClick={() => markSectionRead(topic.slug, section.id)}
                            className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-colors ${readSections.includes(section.id) ? 'bg-green-900/15 border-green-800/40 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'}`}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {readSections.includes(section.id) ? 'Marked as read' : 'Mark as read'}
                          </button>
                        </div>
                      ),
                    }))} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* DIAGRAMS */}
            {activeTab === 'diagrams' && (
              <div className="space-y-6">
                {DiagramComponents.length === 0 ? (
                  <div className="card p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">
                      {['vpc', 'iam', 'disaster-recovery', 'serverless', 'well-architected'].includes(slug || '')
                        ? 'Loading diagrams...'
                        : 'Architecture diagrams coming soon for this topic.'}
                    </p>
                  </div>
                ) : DiagramComponents.map((Diagram, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}>
                    <Diagram />
                  </motion.div>
                ))}
              </div>
            )}

            {/* COMPARE */}
            {activeTab === 'compare' && (
              <div className="space-y-5">
                {allComparisons.length === 0 ? (
                  <div className="card p-12 text-center"><GitBranch className="w-12 h-12 text-gray-700 mx-auto mb-4" /><p className="text-gray-500">Comparison tables coming soon.</p></div>
                ) : allComparisons.map((comp, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-800">{comp.headers.map((h, hi) => (<th key={hi} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>))}</tr></thead>
                      <tbody>{comp.rows.map((row, ri) => (<tr key={ri} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">{row.map((cell, ci) => (<td key={ci} className={`px-4 py-3 text-sm ${ci === 0 ? 'font-medium text-white' : 'text-gray-300'}`}>{cell}</td>))}</tr>))}</tbody>
                    </table>
                  </motion.div>
                ))}
              </div>
            )}

            {/* USE CASES */}
            {activeTab === 'usecases' && (
              <div className="space-y-4">
                {allUseCases.length === 0 ? (
                  <div className="card p-12 text-center"><Target className="w-12 h-12 text-gray-700 mx-auto mb-4" /><p className="text-gray-500">Use case scenarios coming soon.</p></div>
                ) : allUseCases.map((uc, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-6 h-6 rounded bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0 text-xs font-bold text-blue-400">S</div>
                      <p className="text-gray-200 text-sm leading-relaxed">{uc.scenario}</p>
                    </div>
                    <div className="pl-9 space-y-1.5 mb-2">
                      {uc.wrongChoices.map((wc, wi) => (
                        <div key={wi} className="flex items-start gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/25">
                          <span className="text-red-400 text-xs font-bold flex-shrink-0 mt-0.5">X</span>
                          <span className="text-sm text-gray-400">{wc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pl-9 mb-2">
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-green-900/10 border border-green-800/35">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-green-300 font-medium">{uc.correctChoice}</span>
                      </div>
                    </div>
                    <div className="pl-9">
                      <div className="flex items-start gap-2 p-2 rounded-lg bg-gray-800/40">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-400">{uc.reasoning}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* MNEMONICS */}
            {activeTab === 'mnemonics' && (
              <div className="space-y-4">
                {allMnemonics.length === 0 ? (
                  <div className="card p-12 text-center"><Zap className="w-12 h-12 text-gray-700 mx-auto mb-4" /><p className="text-gray-500">Memory aids coming soon.</p></div>
                ) : allMnemonics.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="card p-5 border border-purple-800/35 bg-purple-900/5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{m.phrase}</div>
                        <div className="text-xs text-purple-400 mt-0.5 capitalize">{m.visualCueType} technique</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 pl-11">
                      {m.expansion.map((item, ei) => (
                        <motion.div key={ei} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + ei * 0.05 }}
                          className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">{ei + 1}</span>
                          <span className="text-gray-300">{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev/Next Nav */}
      <div className="border-t border-gray-800 px-5 py-4 flex items-center justify-between">
        {prevTopic ? (
          <Link to={ROUTES.TOPIC(prevTopic.slug)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white group transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <div><div className="text-xs text-gray-600">Previous</div><div>{prevTopic.shortTitle}</div></div>
          </Link>
        ) : <div />}
        <Link to={`${ROUTES.QUIZ}?topic=${topic.slug}`} className="btn-primary flex items-center gap-2 text-sm">
          <Target className="w-4 h-4" /> Practice
        </Link>
        {nextTopic ? (
          <Link to={ROUTES.TOPIC(nextTopic.slug)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white group transition-colors">
            <div className="text-right"><div className="text-xs text-gray-600">Next</div><div>{nextTopic.shortTitle}</div></div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
