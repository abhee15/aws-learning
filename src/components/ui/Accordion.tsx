import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  badge?: string;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenId?: string;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, defaultOpenId, className = '' }: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(defaultOpenId ? [defaultOpenId] : [])
  );

  const toggle = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(allowMultiple ? prev : new Set<string>());
      if (prev.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map(item => (
        <div key={item.id} className="border border-gray-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-100">{item.title}</span>
              {item.badge && (
                <span className="px-2 py-0.5 bg-aws-orange/20 text-aws-orange text-xs rounded">{item.badge}</span>
              )}
            </div>
            <motion.div animate={{ rotate: openIds.has(item.id) ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIds.has(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-gray-800">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
