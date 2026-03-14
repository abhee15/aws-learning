import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'orange' | 'green' | 'blue' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

const colorStyles = {
  orange: 'bg-aws-orange',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({ value, max = 100, color = 'orange', size = 'md', showLabel = false, className = '', animated = true }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        {animated ? (
          <motion.div
            className={`h-full rounded-full ${colorStyles[color]}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        ) : (
          <div className={`h-full rounded-full ${colorStyles[color]}`} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
}
