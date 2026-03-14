import { motion } from 'framer-motion';

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

function Diamond({ x, y, w, h, label, sub, color }: { x: number; y: number; w: number; h: number; label: string; sub?: string; color: string }) {
  const cx = x + w / 2, cy = y + h / 2;
  const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
  return (
    <>
      <polygon points={points} fill={`${color}20`} stroke={color} strokeWidth="1.5" />
      <text x={cx} y={cy - 4} fill="#F9FAFB" fontSize="10" textAnchor="middle" fontWeight="600">{label}</text>
      {sub && <text x={cx} y={cy + 10} fill="#9CA3AF" fontSize="9" textAnchor="middle">{sub}</text>}
    </>
  );
}

export function IamPolicyDiagram() {
  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">IAM Policy Evaluation Logic</h3>
      <svg viewBox="0 0 680 600" className="w-full max-w-2xl mx-auto" style={{ minWidth: 420 }}>

        {/* Step 1: API Request */}
        <motion.g {...fadeIn(0)}>
          <rect x="240" y="10" width="200" height="36" rx="6" fill="#1F2937" stroke="#FF9900" strokeWidth="1.5" />
          <text x="340" y="33" fill="#FF9900" fontSize="12" textAnchor="middle" fontWeight="600">API Request</text>
        </motion.g>

        <motion.path d="M 340 46 L 340 70" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(0.1)} />

        {/* Step 1 diamond: Explicit Deny? */}
        <motion.g {...fadeIn(0.2)}>
          <Diamond x={220} y={70} w={240} h={60} label="1. Explicit DENY?" sub="any policy" color="#EF4444" />
          {/* YES → DENY */}
          <path d="M 460 100 L 600 100" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="530" y="92" fill="#EF4444" fontSize="10" textAnchor="middle">YES</text>
          <rect x="600" y="82" width="68" height="36" rx="6" fill="#EF444430" stroke="#EF4444" strokeWidth="1.5" />
          <text x="634" y="105" fill="#EF4444" fontSize="12" textAnchor="middle" fontWeight="700">DENY</text>
        </motion.g>

        <motion.path d="M 340 130 L 340 160" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(0.3)} />
        <motion.text x="348" y="150" fill="#6B7280" fontSize="9" {...fadeIn(0.3)}>NO</motion.text>

        {/* Step 2: SCP Allow? */}
        <motion.g {...fadeIn(0.4)}>
          <Diamond x={220} y={160} w={240} h={60} label="2. SCP Allows?" sub="Organizations" color="#F59E0B" />
          <path d="M 220 190 L 60 190" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="140" y="182" fill="#EF4444" fontSize="10" textAnchor="middle">NO</text>
          <rect x="0" y="172" width="60" height="36" rx="6" fill="#EF444430" stroke="#EF4444" strokeWidth="1.5" />
          <text x="30" y="195" fill="#EF4444" fontSize="12" textAnchor="middle" fontWeight="700">DENY</text>
        </motion.g>

        <motion.path d="M 340 220 L 340 250" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(0.5)} />
        <motion.text x="348" y="240" fill="#6B7280" fontSize="9" {...fadeIn(0.5)}>YES</motion.text>

        {/* Step 3: Resource Policy? */}
        <motion.g {...fadeIn(0.6)}>
          <Diamond x={200} y={250} w={280} h={60} label="3. Resource Policy" sub="allows access?" color="#8B5CF6" />
          <path d="M 480 280 L 600 280" stroke="#22C55E" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="540" y="272" fill="#22C55E" fontSize="10" textAnchor="middle">YES (cross-acct)</text>
          <rect x="600" y="262" width="68" height="36" rx="6" fill="#22C55E30" stroke="#22C55E" strokeWidth="1.5" />
          <text x="634" y="285" fill="#22C55E" fontSize="12" textAnchor="middle" fontWeight="700">ALLOW</text>
        </motion.g>

        <motion.path d="M 340 310 L 340 340" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(0.7)} />
        <motion.text x="348" y="330" fill="#6B7280" fontSize="9" {...fadeIn(0.7)}>NO/continue</motion.text>

        {/* Step 4: Identity Policy? */}
        <motion.g {...fadeIn(0.8)}>
          <Diamond x={200} y={340} w={280} h={60} label="4. Identity Policy" sub="allows action?" color="#3B82F6" />
          <path d="M 200 370 L 60 370" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="130" y="362" fill="#EF4444" fontSize="10" textAnchor="middle">NO</text>
          <rect x="0" y="352" width="60" height="36" rx="6" fill="#EF444430" stroke="#EF4444" strokeWidth="1.5" />
          <text x="30" y="375" fill="#EF4444" fontSize="12" textAnchor="middle" fontWeight="700">DENY</text>
        </motion.g>

        <motion.path d="M 340 400 L 340 430" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(0.9)} />
        <motion.text x="348" y="420" fill="#6B7280" fontSize="9" {...fadeIn(0.9)}>YES</motion.text>

        {/* Step 5: Permission Boundary? */}
        <motion.g {...fadeIn(1.0)}>
          <Diamond x={200} y={430} w={280} h={60} label="5. Permission Boundary" sub="allows action?" color="#06B6D4" />
          <path d="M 200 460 L 60 460" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="130" y="452" fill="#EF4444" fontSize="10" textAnchor="middle">NO</text>
          <rect x="0" y="442" width="60" height="36" rx="6" fill="#EF444430" stroke="#EF4444" strokeWidth="1.5" />
          <text x="30" y="465" fill="#EF4444" fontSize="12" textAnchor="middle" fontWeight="700">DENY</text>
        </motion.g>

        <motion.path d="M 340 490 L 340 520" stroke="#4B5563" strokeWidth="1.5" markerEnd="url(#arrow)" {...fadeIn(1.1)} />
        <motion.text x="348" y="510" fill="#6B7280" fontSize="9" {...fadeIn(1.1)}>YES</motion.text>

        {/* Final ALLOW */}
        <motion.g {...fadeIn(1.2)}>
          <rect x="270" y="520" width="140" height="48" rx="8" fill="#22C55E30" stroke="#22C55E" strokeWidth="2" />
          <text x="340" y="540" fill="#22C55E" fontSize="14" textAnchor="middle" fontWeight="700">ALLOW</text>
          <text x="340" y="558" fill="#6B7280" fontSize="9" textAnchor="middle">Request succeeds</text>
        </motion.g>

        {/* Arrow marker */}
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#4B5563" />
          </marker>
        </defs>
      </svg>

      <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/40">
        <p className="text-xs text-yellow-300 font-semibold mb-1">Key Rule — Explicit Deny Always Wins</p>
        <p className="text-xs text-gray-400">A single explicit DENY anywhere in the evaluation chain (SCP, resource policy, identity policy, permission boundary) results in an immediate DENY. The default is implicit DENY for all actions.</p>
      </div>
    </div>
  );
}
