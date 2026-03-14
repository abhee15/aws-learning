import { motion } from 'framer-motion';

export function VpcDiagram() {
  return (
    <div className="w-full rounded-xl bg-gray-950 border border-gray-800 p-6 overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">VPC Architecture — Multi-AZ Design</h3>
      <svg viewBox="0 0 760 440" className="w-full max-w-3xl mx-auto" style={{ minWidth: 480 }}>
        {/* VPC boundary */}
        <rect x="10" y="10" width="740" height="420" rx="12" fill="none" stroke="#374151" strokeWidth="2" strokeDasharray="8 4" />
        <text x="24" y="32" fill="#6B7280" fontSize="12" fontFamily="monospace">VPC 10.0.0.0/16</text>

        {/* Internet Gateway */}
        <motion.rect initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          x="310" y="20" width="140" height="36" rx="6" fill="#1F2937" stroke="#FF9900" strokeWidth="1.5" />
        <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          x="380" y="42" fill="#FF9900" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Internet Gateway</motion.text>

        {/* AZ-1a */}
        <rect x="30" y="70" width="330" height="340" rx="8" fill="none" stroke="#1D4ED8" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="46" y="90" fill="#3B82F6" fontSize="11" fontFamily="monospace">AZ us-east-1a</text>

        {/* AZ-1b */}
        <rect x="400" y="70" width="330" height="340" rx="8" fill="none" stroke="#1D4ED8" strokeWidth="1.5" strokeDasharray="5 3" />
        <text x="416" y="90" fill="#3B82F6" fontSize="11" fontFamily="monospace">AZ us-east-1b</text>

        {/* Public subnet AZ-1a */}
        <rect x="50" y="100" width="290" height="130" rx="6" fill="#0EA5E910" stroke="#0EA5E9" strokeWidth="1" />
        <text x="66" y="118" fill="#0EA5E9" fontSize="10" fontFamily="monospace">Public Subnet 10.0.1.0/24</text>

        {/* EC2 in public AZ-1a */}
        <rect x="66" y="128" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="106" y="145" fill="#D1D5DB" fontSize="10" textAnchor="middle">EC2</text>
        <text x="106" y="158" fill="#6B7280" fontSize="8" textAnchor="middle">Web Server</text>

        {/* NAT Gateway in public AZ-1a */}
        <rect x="190" y="128" width="120" height="40" rx="4" fill="#1F2937" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="250" y="145" fill="#F59E0B" fontSize="10" textAnchor="middle">NAT Gateway</text>
        <text x="250" y="158" fill="#6B7280" fontSize="8" textAnchor="middle">Elastic IP</text>

        {/* Private subnet AZ-1a */}
        <rect x="50" y="250" width="290" height="140" rx="6" fill="#16A34A10" stroke="#16A34A" strokeWidth="1" />
        <text x="66" y="268" fill="#16A34A" fontSize="10" fontFamily="monospace">Private Subnet 10.0.3.0/24</text>

        {/* RDS primary */}
        <rect x="66" y="278" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="106" y="295" fill="#D1D5DB" fontSize="10" textAnchor="middle">RDS</text>
        <text x="106" y="308" fill="#6B7280" fontSize="8" textAnchor="middle">Primary</text>

        {/* EC2 App in private */}
        <rect x="190" y="278" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="230" y="295" fill="#D1D5DB" fontSize="10" textAnchor="middle">EC2</text>
        <text x="230" y="308" fill="#6B7280" fontSize="8" textAnchor="middle">App Server</text>

        {/* Public subnet AZ-1b */}
        <rect x="420" y="100" width="290" height="130" rx="6" fill="#0EA5E910" stroke="#0EA5E9" strokeWidth="1" />
        <text x="436" y="118" fill="#0EA5E9" fontSize="10" fontFamily="monospace">Public Subnet 10.0.2.0/24</text>

        {/* EC2 in public AZ-1b */}
        <rect x="436" y="128" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="476" y="145" fill="#D1D5DB" fontSize="10" textAnchor="middle">EC2</text>
        <text x="476" y="158" fill="#6B7280" fontSize="8" textAnchor="middle">Web Server</text>

        {/* NAT Gateway AZ-1b */}
        <rect x="560" y="128" width="120" height="40" rx="4" fill="#1F2937" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="620" y="145" fill="#F59E0B" fontSize="10" textAnchor="middle">NAT Gateway</text>
        <text x="620" y="158" fill="#6B7280" fontSize="8" textAnchor="middle">Elastic IP</text>

        {/* Private subnet AZ-1b */}
        <rect x="420" y="250" width="290" height="140" rx="6" fill="#16A34A10" stroke="#16A34A" strokeWidth="1" />
        <text x="436" y="268" fill="#16A34A" fontSize="10" fontFamily="monospace">Private Subnet 10.0.4.0/24</text>

        {/* RDS standby */}
        <rect x="436" y="278" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="476" y="295" fill="#D1D5DB" fontSize="10" textAnchor="middle">RDS</text>
        <text x="476" y="308" fill="#6B7280" fontSize="8" textAnchor="middle">Standby</text>

        {/* EC2 App private AZ-1b */}
        <rect x="560" y="278" width="80" height="40" rx="4" fill="#1F2937" stroke="#374151" strokeWidth="1" />
        <text x="600" y="295" fill="#D1D5DB" fontSize="10" textAnchor="middle">EC2</text>
        <text x="600" y="308" fill="#6B7280" fontSize="8" textAnchor="middle">App Server</text>

        {/* Animated lines */}
        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
          x1="350" y1="56" x2="195" y2="100" stroke="#FF9900" strokeWidth="1.5" strokeDasharray="5 3" />
        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}
          x1="410" y1="56" x2="560" y2="100" stroke="#FF9900" strokeWidth="1.5" strokeDasharray="5 3" />
        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}
          x1="250" y1="168" x2="200" y2="250" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}
          x1="620" y1="168" x2="560" y2="250" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
        <motion.line initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.9, duration: 0.8 }}
          x1="146" y1="298" x2="436" y2="298" stroke="#A855F7" strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="291" y="293" fill="#A855F7" fontSize="9" textAnchor="middle">sync</text>

        {/* Legend */}
        <rect x="20" y="400" width="12" height="3" fill="#0EA5E9" rx="1" />
        <text x="36" y="407" fill="#6B7280" fontSize="9">Public Subnet</text>
        <rect x="120" y="400" width="12" height="3" fill="#16A34A" rx="1" />
        <text x="136" y="407" fill="#6B7280" fontSize="9">Private Subnet</text>
        <rect x="230" y="400" width="12" height="3" fill="#FF9900" rx="1" />
        <text x="246" y="407" fill="#6B7280" fontSize="9">Internet Gateway</text>
        <rect x="360" y="400" width="12" height="3" fill="#F59E0B" rx="1" />
        <text x="376" y="407" fill="#6B7280" fontSize="9">NAT Gateway</text>
        <rect x="460" y="400" width="12" height="3" fill="#A855F7" rx="1" />
        <text x="476" y="407" fill="#6B7280" fontSize="9">Sync Replication</text>
      </svg>
    </div>
  );
}
