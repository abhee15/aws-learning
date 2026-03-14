import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Shield, RotateCcw, Zap, DollarSign, Leaf } from 'lucide-react';

const pillars = [
  {
    id: 'op-excellence',
    label: 'Operational Excellence',
    icon: Settings,
    color: '#3B82F6',
    bg: 'bg-blue-900/20',
    border: 'border-blue-800/50',
    principles: [
      'Perform operations as code (CloudFormation, SSM Automation)',
      'Make frequent, small, reversible changes',
      'Refine operations procedures frequently (GameDay exercises)',
      'Anticipate failure — pre-mortem analysis',
      'Learn from all operational failures',
    ],
    awsServices: 'CloudFormation, Systems Manager, CloudWatch, X-Ray, EventBridge',
    examTip: 'Operations as code = CloudFormation + SSM. Event-driven remediation = Config rule → EventBridge → Lambda → SSM.',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    color: '#EF4444',
    bg: 'bg-red-900/20',
    border: 'border-red-800/50',
    principles: [
      'Implement a strong identity foundation (least privilege, MFA, no long-term keys)',
      'Enable traceability (CloudTrail, Config, VPC Flow Logs)',
      'Apply security at all layers (edge, VPC, SG, application, data)',
      'Automate security best practices',
      'Protect data in transit and at rest (TLS, KMS)',
      'Keep people away from data (roles, not shared credentials)',
    ],
    awsServices: 'IAM, Organizations, KMS, GuardDuty, Security Hub, WAF, Shield',
    examTip: 'Defense in depth: network layer (WAF, Shield) → application layer → data layer (KMS). No long-term access keys — use instance profiles and STS.',
  },
  {
    id: 'reliability',
    label: 'Reliability',
    icon: RotateCcw,
    color: '#22C55E',
    bg: 'bg-green-900/20',
    border: 'border-green-800/50',
    principles: [
      'Automatically recover from failure (CloudWatch alarms + Auto Scaling)',
      'Test recovery procedures (AWS Fault Injection Simulator)',
      'Scale horizontally to increase aggregate availability',
      'Stop guessing capacity (Auto Scaling, serverless)',
      'Manage change through automation (blue/green, canary)',
    ],
    awsServices: 'Route 53, ELB, Auto Scaling, Multi-AZ RDS, AWS Backup, FIS',
    examTip: 'Design for multiple AZs minimum. RTO (downtime) and RPO (data loss) are business decisions — architecture must meet them. SQS DLQ for failed processing.',
  },
  {
    id: 'performance',
    label: 'Performance Efficiency',
    icon: Zap,
    color: '#F59E0B',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-800/50',
    principles: [
      'Democratize advanced technologies (managed services)',
      'Go global in minutes (CloudFront, Global Accelerator, multi-region)',
      'Use serverless architectures',
      'Experiment more often (A/B test instance types)',
      'Consider mechanical sympathy (choose the right tool)',
    ],
    awsServices: 'CloudFront, ElastiCache, Auto Scaling, Lambda, Compute Optimizer, Graviton',
    examTip: 'Compute Optimizer uses ML to right-size EC2, Lambda, ECS, EBS. Graviton3 = better price-performance for non-x86. ElastiCache for read-heavy patterns.',
  },
  {
    id: 'cost',
    label: 'Cost Optimization',
    icon: DollarSign,
    color: '#FF9900',
    bg: 'bg-orange-900/20',
    border: 'border-orange-800/50',
    principles: [
      'Implement cloud financial management (FinOps, tagging)',
      'Adopt a consumption model (pay for what you use)',
      'Measure overall efficiency (output / cost)',
      'Stop spending on undifferentiated heavy lifting',
      'Analyze and attribute expenditure (Cost Explorer, CUR)',
    ],
    awsServices: 'Cost Explorer, Budgets, CUR, Compute Optimizer, Savings Plans',
    examTip: 'Compute Savings Plans > EC2 Instance Savings Plans for flexibility. Spot for fault-tolerant. Activate cost allocation tags in Billing console first.',
  },
  {
    id: 'sustainability',
    label: 'Sustainability',
    icon: Leaf,
    color: '#10B981',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-800/50',
    principles: [
      'Understand your environmental impact (Customer Carbon Footprint Tool)',
      'Establish sustainability goals',
      'Maximize utilization (right-sizing, Auto Scaling)',
      'Anticipate and adopt efficient hardware (Graviton)',
      'Use managed services (provider optimizes at scale)',
    ],
    awsServices: 'Graviton processors, Serverless, Spot Instances, Customer Carbon Footprint Tool',
    examTip: 'Sustainability = newest pillar (2021). Choose smallest/most efficient option. Serverless and Graviton are preferred sustainable choices on the exam.',
  },
];

export function WellArchDiagram() {
  const [selected, setSelected] = useState<string | null>(null);
  const activePillar = pillars.find(p => p.id === selected);

  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6">
      <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">AWS Well-Architected Framework — 6 Pillars</h3>
      <p className="text-xs text-gray-600 mb-5">Click a pillar to expand key principles and SA Pro exam tips</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {pillars.map(pillar => {
          const Icon = pillar.icon;
          const isActive = selected === pillar.id;
          return (
            <motion.button key={pillar.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(isActive ? null : pillar.id)}
              className={`p-4 rounded-xl border text-left transition-all ${isActive ? `${pillar.bg} ${pillar.border} ring-1 ring-offset-0` : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'}`}>
              <Icon className="w-5 h-5 mb-2" style={{ color: pillar.color }} />
              <div className="text-xs font-semibold text-white leading-tight">{pillar.label}</div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activePillar && (
          <motion.div key={activePillar.id}
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className={`rounded-xl border p-5 overflow-hidden ${activePillar.bg} ${activePillar.border}`}>
            <div className="flex items-center gap-2 mb-4">
              <activePillar.icon className="w-5 h-5" style={{ color: activePillar.color }} />
              <h4 className="font-bold text-white">{activePillar.label}</h4>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Design Principles</p>
              <ul className="space-y-1.5">
                {activePillar.principles.map((p, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 text-xs text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: activePillar.color }} />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Key AWS Services</p>
              <p className="text-xs text-gray-400">{activePillar.awsServices}</p>
            </div>

            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
              <p className="text-xs font-semibold text-yellow-400 mb-1">SA Pro Exam Tip</p>
              <p className="text-xs text-gray-300">{activePillar.examTip}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
