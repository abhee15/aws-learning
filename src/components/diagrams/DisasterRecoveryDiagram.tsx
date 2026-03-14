import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Pattern = 'backup' | 'pilot' | 'warm' | 'active';

const patterns: Record<Pattern, {
  label: string; rto: string; rpo: string; cost: string; costLevel: number;
  primary: string[]; dr: string[]; description: string; color: string;
}> = {
  backup: {
    label: 'Backup & Restore',
    rto: 'Hours', rpo: 'Hours', cost: '$', costLevel: 1,
    primary: ['EC2 (running)', 'RDS (running)', 'S3 Backups', 'AMI snapshots'],
    dr: ['Restore from S3', 'Launch from AMI', 'Restore RDS snapshot'],
    description: 'Cheapest option. All production resources run in primary. On disaster, restore from backups/snapshots in DR region. Suitable for non-critical workloads with acceptable hours of downtime.',
    color: '#22C55E',
  },
  pilot: {
    label: 'Pilot Light',
    rto: '10-60 min', rpo: 'Minutes', cost: '$$', costLevel: 2,
    primary: ['EC2 (running)', 'RDS Primary (running)', 'Full production stack'],
    dr: ['RDS Replica (running)', 'EC2 AMIs ready', 'Scale up on failover', 'Route 53 health check'],
    description: 'Core data tier runs continuously in DR (database replication). Compute is off or minimal. On failover: scale compute, update DNS. Like a pilot light — minimal flame that can quickly grow.',
    color: '#F59E0B',
  },
  warm: {
    label: 'Warm Standby',
    rto: '1-10 min', rpo: 'Seconds', cost: '$$$', costLevel: 3,
    primary: ['Full production stack', 'Active traffic', 'All services running'],
    dr: ['Scaled-down copy (running)', 'DB replica (running)', 'Auto Scaling ready', 'Load balancer configured'],
    description: 'A fully functional but reduced-capacity environment runs in DR at all times. Handles limited load normally. On failover: scale out to full capacity. Fastest failover short of active-active.',
    color: '#F97316',
  },
  active: {
    label: 'Active-Active (Multi-Site)',
    rto: 'Near zero', rpo: 'Near zero', cost: '$$$$', costLevel: 4,
    primary: ['Full stack running', 'Serving live traffic', 'Global Accelerator / Route 53'],
    dr: ['Full stack running', 'Serving live traffic', 'Automated failover', 'Data sync (challenge)'],
    description: 'Full workload runs in multiple regions simultaneously. Route 53 latency/weighted routing distributes traffic. Most expensive — requires data consistency solutions (Aurora Global, DynamoDB Global Tables).',
    color: '#EF4444',
  },
};

const costDots = (level: number) => Array.from({ length: 4 }, (_, i) => (
  <span key={i} className={`inline-block w-2 h-2 rounded-full mx-0.5 ${i < level ? 'bg-aws-orange' : 'bg-gray-700'}`} />
));

export function DisasterRecoveryDiagram() {
  const [selected, setSelected] = useState<Pattern>('backup');
  const p = patterns[selected];

  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Disaster Recovery Patterns — RTO/RPO Tradeoffs</h3>

      {/* Pattern selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
        {(Object.keys(patterns) as Pattern[]).map(key => (
          <button key={key} onClick={() => setSelected(key)}
            className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${selected === key ? 'border-aws-orange bg-aws-orange/10 text-aws-orange' : 'border-gray-800 text-gray-400 hover:border-gray-700'}`}>
            {patterns[key].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'RTO', value: p.rto, color: 'text-blue-400' },
              { label: 'RPO', value: p.rpo, color: 'text-green-400' },
              { label: 'Relative Cost', value: costDots(p.costLevel), color: 'text-aws-orange' },
            ].map(m => (
              <div key={m.label} className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
                <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                <div className={`font-bold text-sm ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Architecture diagram */}
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {/* Primary Region */}
            <div className="rounded-xl border border-blue-800/40 bg-blue-900/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase">Primary Region</span>
              </div>
              <div className="space-y-1.5">
                {p.primary.map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-xs text-gray-300 bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-800">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* DR Region */}
            <div className={`rounded-xl border bg-gray-900/20 p-4`} style={{ borderColor: `${p.color}40` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs font-semibold uppercase" style={{ color: p.color }}>DR Region</span>
              </div>
              <div className="space-y-1.5">
                {p.dr.map((item, i) => (
                  <motion.div key={item} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-2 text-xs text-gray-300 bg-gray-900/60 rounded-lg px-3 py-2 border border-gray-800">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
            <p className="text-xs text-gray-300 leading-relaxed">{p.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* RTO/RPO spectrum */}
      <div className="mt-5 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 mb-2">Cost vs Recovery Speed</p>
        <div className="flex items-center gap-1">
          {['Backup & Restore', 'Pilot Light', 'Warm Standby', 'Active-Active'].map((l, i) => (
            <div key={l} className="flex-1 text-center">
              <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-yellow-500' : i === 2 ? 'bg-orange-500' : 'bg-red-500'}`} />
              <p className="text-[9px] text-gray-600 mt-1 leading-tight">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-600">Low cost / High RTO</span>
          <span className="text-[9px] text-gray-600">High cost / Low RTO</span>
        </div>
      </div>
    </div>
  );
}
