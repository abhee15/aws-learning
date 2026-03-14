import { useState } from 'react';
import { motion } from 'framer-motion';

const nodes = [
  { id: 'prod', label: 'VPC-Prod', sub: '10.1.0.0/16', angle: 270, color: '#3B82F6' },
  { id: 'dev', label: 'VPC-Dev', sub: '10.2.0.0/16', angle: 330, color: '#22C55E' },
  { id: 'shared', label: 'Shared Services', sub: '10.3.0.0/16', angle: 30, color: '#8B5CF6' },
  { id: 'security', label: 'Security VPC', sub: '10.4.0.0/16', angle: 90, color: '#EF4444' },
  { id: 'onprem', label: 'On-Premises', sub: 'Direct Connect', angle: 150, color: '#F59E0B' },
  { id: 'partner', label: 'VPC-Partner', sub: '10.5.0.0/16', angle: 210, color: '#EC4899' },
];

const cx = 340, cy = 220, radius = 160;

function toXY(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const routeTables = [
  { name: 'Default Route Table', desc: 'All VPCs can reach each other (fully meshed)', isolated: false },
  { name: 'Dev Isolation RT', desc: 'Dev VPC cannot reach Prod. Both can reach Shared Services.', isolated: true },
  { name: 'Security RT', desc: 'Security VPC receives routes from all attachments for inspection', isolated: false },
];

export function TransitGatewayDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeRT, setActiveRT] = useState(0);

  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Transit Gateway — Hub & Spoke Architecture</h3>

      <svg viewBox="0 0 680 450" className="w-full max-w-2xl mx-auto" style={{ minWidth: 420 }}>
        {/* Connection lines */}
        {nodes.map((node, i) => {
          const pos = toXY(node.angle, radius);
          const isActive = activeNode === node.id;
          return (
            <motion.line key={node.id}
              x1={cx} y1={cy} x2={pos.x} y2={pos.y}
              stroke={isActive ? node.color : '#374151'}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray="6 4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
            />
          );
        })}

        {/* Central TGW hub */}
        <motion.circle cx={cx} cy={cy} r={55}
          fill="#1F2937" stroke="#FF9900" strokeWidth="2.5"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} />
        <text x={cx} y={cy - 8} fill="#FF9900" fontSize="12" textAnchor="middle" fontWeight="700">Transit</text>
        <text x={cx} y={cy + 8} fill="#FF9900" fontSize="12" textAnchor="middle" fontWeight="700">Gateway</text>
        <text x={cx} y={cy + 24} fill="#9CA3AF" fontSize="9" textAnchor="middle">Route Tables</text>

        {/* VPC/Node boxes */}
        {nodes.map((node, i) => {
          const pos = toXY(node.angle, radius + 5);
          const bw = 120, bh = 50;
          const bx = pos.x - bw / 2, by = pos.y - bh / 2;
          const isActive = activeNode === node.id;
          return (
            <motion.g key={node.id}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.08 }}
              style={{ cursor: 'pointer' }} onClick={() => setActiveNode(isActive ? null : node.id)}>
              <rect x={bx} y={by} width={bw} height={bh} rx="6"
                fill={isActive ? `${node.color}20` : '#111827'}
                stroke={node.color} strokeWidth={isActive ? 2 : 1.5} />
              <text x={pos.x} y={pos.y - 6} fill="#F9FAFB" fontSize="10" textAnchor="middle" fontWeight="600">{node.label}</text>
              <text x={pos.x} y={pos.y + 10} fill="#9CA3AF" fontSize="8" textAnchor="middle">{node.sub}</text>
            </motion.g>
          );
        })}
      </svg>

      {/* Route Table concept */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TGW Route Table Patterns</p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {routeTables.map((rt, i) => (
            <button key={rt.name} onClick={() => setActiveRT(i)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activeRT === i ? 'border-aws-orange bg-aws-orange/10 text-aws-orange' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}>
              {rt.name}
            </button>
          ))}
        </div>
        <div className="p-3 rounded-lg bg-gray-900 border border-gray-800">
          <p className="text-xs text-gray-300">{routeTables[activeRT].desc}</p>
          {routeTables[activeRT].isolated && (
            <p className="text-xs text-yellow-400 mt-1.5">Isolation is achieved by NOT propagating routes between route tables — Dev never learns Prod routes.</p>
          )}
        </div>
      </div>

      <div className="mt-3 p-3 rounded-lg bg-blue-900/20 border border-blue-800/40">
        <p className="text-xs font-semibold text-blue-400 mb-1">SA Pro Key Points</p>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• TGW supports transitive routing (VPCs can reach each other via the hub) — VPC Peering does NOT</li>
          <li>• Multiple route tables enable network segmentation (Prod isolated from Dev)</li>
          <li>• On-premises connects via Direct Connect Transit VIF or Site-to-Site VPN attachment</li>
          <li>• TGW peering enables inter-region connectivity without VPC Peering</li>
        </ul>
      </div>
    </div>
  );
}
