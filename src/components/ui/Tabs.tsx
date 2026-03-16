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
    <div className={`overflow-x-auto scrollbar-hide px-2 ${className}`}>
      <div className="flex min-w-max">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-3 py-3 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-0.5 px-1.5 py-0.5 rounded text-xs leading-none ${
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
    </div>
  );
}
