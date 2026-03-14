import React from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 border-b border-gray-800 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {tab.icon && <span className="text-base">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
              activeTab === tab.id ? 'bg-aws-orange/20 text-aws-orange' : 'bg-gray-800 text-gray-500'
            }`}>
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-aws-orange rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
