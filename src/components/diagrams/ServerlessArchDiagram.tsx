import { motion } from 'framer-motion';

interface ServiceBoxProps {
  x: number; y: number; w: number; h: number;
  label: string; sub?: string; color: string; delay: number;
}

function ServiceBox({ x, y, w, h, label, sub, color, delay }: ServiceBoxProps) {
  return (
    <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.3 }}>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="#111827" stroke={color} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 - (sub ? 5 : 0)} fill="#F9FAFB" fontSize="10" textAnchor="middle" fontWeight="600">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 10} fill="#9CA3AF" fontSize="8" textAnchor="middle">{sub}</text>}
    </motion.g>
  );
}

function Arrow({ x1, y1, x2, y2, color, delay, label }: { x1: number; y1: number; x2: number; y2: number; color: string; delay: number; label?: string }) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  return (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#sarrow)" />
      {label && <text x={mx} y={my - 4} fill={color} fontSize="8" textAnchor="middle">{label}</text>}
    </motion.g>
  );
}

export function ServerlessArchDiagram() {
  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Serverless Event-Driven Architecture</h3>
      <svg viewBox="0 0 760 500" className="w-full max-w-3xl mx-auto" style={{ minWidth: 500 }}>
        <defs>
          <marker id="sarrow" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L7,2.5 z" fill="#4B5563" />
          </marker>
        </defs>

        {/* Internet / Client */}
        <ServiceBox x={10} y={220} w={80} h={40} label="Client" sub="Browser/App" color="#6B7280" delay={0} />
        <Arrow x1={90} y1={240} x2={130} y2={240} color="#6B7280" delay={0.1} />

        {/* Route 53 */}
        <ServiceBox x={130} y={220} w={80} h={40} label="Route 53" sub="DNS" color="#FF9900" delay={0.1} />
        <Arrow x1={210} y1={240} x2={250} y2={240} color="#FF9900" delay={0.2} />

        {/* CloudFront */}
        <ServiceBox x={250} y={220} w={90} h={40} label="CloudFront" sub="CDN / Edge" color="#FF9900" delay={0.2} />
        <Arrow x1={340} y1={240} x2={380} y2={240} color="#FF9900" delay={0.3} />

        {/* API Gateway */}
        <ServiceBox x={380} y={220} w={100} h={40} label="API Gateway" sub="REST / HTTP" color="#3B82F6" delay={0.3} />

        {/* API → Lambda (main) */}
        <Arrow x1={480} y1={240} x2={540} y2={240} color="#3B82F6" delay={0.4} label="invoke" />

        {/* Lambda — main handler */}
        <ServiceBox x={540} y={215} w={110} h={50} label="Lambda" sub="Handler fn" color="#22C55E" delay={0.4} />

        {/* Lambda → DynamoDB */}
        <Arrow x1={595} y1={265} x2={595} y2={305} color="#22C55E" delay={0.5} />
        <ServiceBox x={540} y={305} w={110} h={40} label="DynamoDB" sub="NoSQL store" color="#22C55E" delay={0.5} />

        {/* Lambda → SQS */}
        <Arrow x1={650} y1={240} x2={700} y2={190} color="#F59E0B" delay={0.6} />
        <ServiceBox x={700} y={165} w={50} h={50} label="SQS" color="#F59E0B" delay={0.6} />

        {/* SQS → Lambda worker */}
        <Arrow x1={710} y1={215} x2={690} y2={300} color="#F59E0B" delay={0.7} label="trigger" />
        <ServiceBox x={650} y={300} w={100} h={40} label="Lambda" sub="Worker fn" color="#A855F7" delay={0.7} />

        {/* Worker → S3 */}
        <Arrow x1={700} y1={340} x2={700} y2={390} color="#A855F7" delay={0.8} />
        <ServiceBox x={650} y={390} w={100} h={40} label="S3" sub="Results store" color="#22C55E" delay={0.8} />

        {/* EventBridge bus (top) */}
        <ServiceBox x={380} y={80} w={110} h={40} label="EventBridge" sub="Event Bus" color="#8B5CF6" delay={0.3} />

        {/* EventBridge → Lambda */}
        <Arrow x1={435} y1={120} x2={475} y2={200} color="#8B5CF6" delay={0.4} label="rule" />

        {/* Another Lambda for EB */}
        <ServiceBox x={420} y={140} w={100} h={40} label="Lambda" sub="Scheduler fn" color="#06B6D4" delay={0.4} />

        {/* Cognito / Auth */}
        <ServiceBox x={380} y={370} w={110} h={40} label="Cognito" sub="User auth" color="#EC4899" delay={0.5} />
        <Arrow x1={380} y1={390} x2={340} y2={260} color="#EC4899" delay={0.5} label="JWT" />

        {/* CloudWatch */}
        <ServiceBox x={10} y={80} w={100} h={40} label="CloudWatch" sub="Logs/Metrics" color="#6B7280" delay={0.2} />

        {/* X-Ray */}
        <ServiceBox x={10} y={140} w={100} h={40} label="X-Ray" sub="Tracing" color="#6B7280" delay={0.25} />

        {/* DynamoDB Streams → Lambda */}
        <Arrow x1={540} y1={325} x2={480} y2={325} color="#06B6D4" delay={0.9} label="stream" />
        <ServiceBox x={380} y={305} w={100} h={40} label="Lambda" sub="Stream proc." color="#06B6D4" delay={0.9} />

        {/* Legend */}
        <text x="10" y="475" fill="#4B5563" fontSize="9">Event-driven: EventBridge rules → Lambda → SQS workers → S3. API requests: CloudFront → API GW → Lambda → DynamoDB</text>
      </svg>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {[
          { color: '#FF9900', label: 'Edge / CDN' },
          { color: '#3B82F6', label: 'API Layer' },
          { color: '#22C55E', label: 'Compute / Storage' },
          { color: '#8B5CF6', label: 'Event Routing' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-gray-500">
            <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}
