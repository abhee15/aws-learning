import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Brain, Target, Trophy,
  ChevronDown, Cpu, Database, Globe,
  Shield, Network, Cloud, Server, GitBranch,
  BarChart3, Zap, Box, HardDrive, MessageSquare,
  Eye, Lock, Truck, Layers,
  DollarSign, RefreshCw, X, LineChart
} from 'lucide-react';
import { ROUTES, TOPIC_SLUGS } from '../../constants/routes';
import { useProgress } from '../../context/ProgressContext';
import { ProgressBar } from '../ui/ProgressBar';

const topicNav = [
  { slug: TOPIC_SLUGS.GLOBAL_INFRA, label: 'Global Infrastructure', icon: Globe },
  { slug: TOPIC_SLUGS.IAM, label: 'IAM & Identity', icon: Shield },
  { slug: TOPIC_SLUGS.VPC, label: 'VPC & Networking', icon: Network },
  { slug: TOPIC_SLUGS.DNS_CDN, label: 'Route 53 & CloudFront', icon: Globe },
  { slug: TOPIC_SLUGS.COMPUTE, label: 'EC2 & Compute', icon: Cpu },
  { slug: TOPIC_SLUGS.SERVERLESS, label: 'Serverless', icon: Zap },
  { slug: TOPIC_SLUGS.CONTAINERS, label: 'Containers', icon: Box },
  { slug: TOPIC_SLUGS.S3, label: 'S3 & Storage', icon: Cloud },
  { slug: TOPIC_SLUGS.BLOCK_FILE, label: 'Block & File Storage', icon: HardDrive },
  { slug: TOPIC_SLUGS.DATABASES, label: 'Databases', icon: Database },
  { slug: TOPIC_SLUGS.MESSAGING, label: 'Messaging & Events', icon: MessageSquare },
  { slug: TOPIC_SLUGS.OBSERVABILITY, label: 'Observability', icon: Eye },
  { slug: TOPIC_SLUGS.SECURITY, label: 'Security', icon: Lock },
  { slug: TOPIC_SLUGS.IAC, label: 'IaC & Automation', icon: GitBranch },
  { slug: TOPIC_SLUGS.NETWORKING, label: 'Hybrid Networking', icon: Server },
  { slug: TOPIC_SLUGS.MIGRATION, label: 'Migration', icon: Truck },
  { slug: TOPIC_SLUGS.ANALYTICS, label: 'Analytics', icon: BarChart3 },
  { slug: TOPIC_SLUGS.ML, label: 'Machine Learning', icon: Brain },
  { slug: TOPIC_SLUGS.WELL_ARCHITECTED, label: 'Well-Architected', icon: Layers },
  { slug: TOPIC_SLUGS.COST, label: 'Cost Optimization', icon: DollarSign },
  { slug: TOPIC_SLUGS.DR, label: 'Disaster Recovery', icon: RefreshCw },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { progress, getTopicCompletion } = useProgress();
  const [topicsExpanded, setTopicsExpanded] = useState(true);

  const overallProgress = () => {
    const total = topicNav.length;
    const started = Object.keys(progress.topics).length;
    return Math.round((started / total) * 100);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="w-9 h-9 rounded-lg bg-orange-gradient flex items-center justify-center">
          <span className="text-white font-bold text-sm">AWS</span>
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">SA Professional</div>
          <div className="text-gray-500 text-xs">Certification Prep</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="px-4 py-3 border-b border-gray-800">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Overall Progress</span>
          <span className="text-aws-orange font-medium">{overallProgress()}%</span>
        </div>
        <ProgressBar value={overallProgress()} color="orange" size="sm" animated={false} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-hide">
        <div className="px-3 space-y-1">
          <p className="section-title px-2">Overview</p>
          <NavItem to={ROUTES.DASHBOARD} icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
          <NavItem to={ROUTES.STUDY_PLAN} icon={Target} label="Study Plan" onClick={onClose} />
          <NavItem to={ROUTES.PROGRESS} icon={LineChart} label="My Progress" onClick={onClose} />
        </div>

        <div className="px-3 mt-4 space-y-1">
          <button
            onClick={() => setTopicsExpanded(!topicsExpanded)}
            className="w-full flex items-center justify-between px-2 py-1 section-title hover:text-gray-400 transition-colors"
          >
            <span>Study Topics ({topicNav.length})</span>
            <motion.div animate={{ rotate: topicsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          </button>
          <AnimatePresence>
            {topicsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-0.5 overflow-hidden"
              >
                {topicNav.map(topic => {
                  const completion = getTopicCompletion(topic.slug, 5);
                  const isActive = location.pathname === ROUTES.TOPIC(topic.slug);
                  return (
                    <NavLink
                      key={topic.slug}
                      to={ROUTES.TOPIC(topic.slug)}
                      onClick={onClose}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-aws-orange/15 text-aws-orange'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      }`}
                    >
                      <topic.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="flex-1 truncate">{topic.label}</span>
                      {completion > 0 && (
                        <span className={`text-xs font-medium ${completion === 100 ? 'text-green-400' : 'text-gray-500'}`}>
                          {completion === 100 ? '✓' : `${completion}%`}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-3 mt-4 space-y-1">
          <p className="section-title px-2">Practice</p>
          <NavItem to={ROUTES.QUIZ} icon={Target} label="Quiz & Exam Prep" onClick={onClose} />
          <NavItem to={ROUTES.FLASHCARDS} icon={Brain} label="Flashcards" onClick={onClose} />
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Trophy className="w-3.5 h-3.5 text-aws-orange" />
          <span>AWS SA Professional Prep</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-gray-950 border-r border-gray-800 fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-30 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-gray-950 border-r border-gray-800 z-40 lg:hidden flex flex-col"
            >
              <div className="absolute right-3 top-3">
                <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavItem({ to, icon: Icon, label, onClick }: { to: string; icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
          isActive
            ? 'bg-aws-orange/15 text-aws-orange font-medium'
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
        }`
      }
    >
      <Icon className="w-4 h-4" />
      {label}
    </NavLink>
  );
}
