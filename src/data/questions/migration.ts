import type { Question } from './index';

export const migrationQuestions: Question[] = [
  {
    id: 'mig-001',
    stem: 'A company needs to migrate 500 TB of data from their on-premises NAS to Amazon S3. They have a 1 Gbps internet connection shared with production traffic. The migration must complete within 2 weeks and minimize internet bandwidth consumption. Which migration approach is most appropriate?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS DataSync over the existing internet connection with bandwidth throttling', correct: false, explanation: 'At 1 Gbps (shared), DataSync could theoretically transfer ~10.8 TB/day. However, 500 TB would take 46+ days — far beyond the 2-week requirement, and it would consume significant production bandwidth.' },
      { id: 'b', text: 'Order multiple AWS Snowball Edge Storage Optimized devices to physically transport data', correct: true, explanation: 'Each Snowball Edge Storage Optimized holds 80 TB usable. For 500 TB, ~7 devices would suffice. Physical shipping takes 2-3 days each way, and data can be loaded in parallel. Total timeline easily fits within 2 weeks without using internet bandwidth.' },
      { id: 'c', text: 'Use S3 Transfer Acceleration to maximize upload speeds over the internet', correct: false, explanation: 'S3 Transfer Acceleration optimizes TCP routing but does not increase available bandwidth. With a shared 1 Gbps connection, 500 TB still cannot be transferred in 2 weeks.' },
      { id: 'd', text: 'Use AWS Direct Connect to establish a dedicated 10 Gbps connection for the migration', correct: false, explanation: 'Direct Connect provisioning takes weeks to months. Even if available, 500 TB at 10 Gbps would take ~110 hours (~4.5 days) — feasible technically but not within the setup timeline.' }
    ],
    explanation: {
      overall: 'AWS Snowball Edge devices are physical appliances used for large-scale data migration when network transfer is too slow or expensive. The rule of thumb: if transferring data over the network would take more than a week, consider Snowball. For 500 TB on a shared 1 Gbps connection, Snowball Edge devices (80 TB each) can be ordered, loaded in parallel, and shipped — completing the transfer in the required timeframe without impacting production traffic.',
      examTip: 'Snowball sizing guide: Snowball Edge Storage Optimized = 80 TB usable, Snowball Edge Compute Optimized = 42 TB usable. Snowball Edge also runs EC2 AMIs and Lambda functions for edge processing. Snowmobile = 100 PB truck. The "internet vs Snowball" decision point: >10 TB over slow connections, or >100 TB generally. Always calculate: (data size / available bandwidth) in days vs Snowball shipping time.'
    },
    tags: ['snowball', 'data-migration', 'offline-transfer', 's3', 'large-scale']
  },
  {
    id: 'mig-002',
    stem: 'A company is migrating a legacy on-premises Oracle database to Amazon Aurora PostgreSQL. They need to minimize downtime (target: <30 minutes) during cutover and must replicate ongoing changes during the migration period. Their database is 2 TB with moderate write traffic. Which approach achieves this?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS DMS with full-load and CDC (change data capture) from Oracle to Aurora PostgreSQL', correct: true, explanation: 'DMS supports heterogeneous migration (Oracle → PostgreSQL). Full-load migrates the initial dataset while CDC continuously replicates ongoing changes. When ready for cutover, stop the application, let DMS drain remaining changes, verify data, then switch. Downtime limited to the drain + verification time.' },
      { id: 'b', text: 'Export the Oracle database using Data Pump, transfer to S3, and import into Aurora PostgreSQL', correct: false, explanation: 'Data Pump export/import requires downtime for the entire export, transfer, and import duration. For 2 TB, this could take many hours — far exceeding the 30-minute downtime target.' },
      { id: 'c', text: 'Use AWS Schema Conversion Tool (SCT) to convert and migrate the database in a single operation', correct: false, explanation: 'AWS SCT converts database schemas and stored procedures but is not a data migration tool. SCT handles the schema layer; DMS handles the data migration and CDC replication.' },
      { id: 'd', text: 'Use RDS Snapshot migration to directly convert an Oracle RDS snapshot to Aurora PostgreSQL', correct: false, explanation: 'Oracle RDS snapshots cannot be directly converted to Aurora PostgreSQL. Cross-engine snapshot conversion is not supported. DMS is required for heterogeneous engine migrations.' }
    ],
    explanation: {
      overall: 'AWS DMS (Database Migration Service) is designed for database migrations with minimal downtime. The process: (1) Create DMS replication instance, (2) Configure source (Oracle) and target (Aurora PostgreSQL) endpoints, (3) Create migration task with "full load + CDC" mode, (4) DMS migrates existing data then begins CDC, (5) Monitor lag until near-zero, (6) Quiesce application, wait for DMS lag to reach 0, verify data integrity, (7) Switch connection strings. AWS SCT converts schema, stored procedures, and application SQL — use it before DMS.',
      examTip: 'DMS migration modes: Full load only (one-time, stops after initial load), Full load + CDC (migrate then keep in sync, minimal downtime cutover), CDC only (ongoing replication for already-migrated data). For near-zero downtime: Full load + CDC. Supported heterogeneous migrations: Oracle→PostgreSQL/Aurora, SQL Server→MySQL/Aurora, MySQL→PostgreSQL. Use SCT first for schema conversion, then DMS for data.'
    },
    tags: ['dms', 'database-migration', 'oracle', 'aurora-postgresql', 'cdc']
  },
  {
    id: 'mig-003',
    stem: 'A company is performing a large-scale migration of 200 virtual machines from VMware vSphere to AWS. They want to track migration progress, manage wave planning (which VMs to migrate in which order), and automate replication without agents on each VM. Which AWS service is most appropriate?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Application Migration Service (MGN) with vCenter integration', correct: true, explanation: 'MGN (formerly CloudEndure) provides agentless integration with VMware vCenter, automatically replicating VMs at the block level. It supports wave planning via Application Groups, tracks replication progress, and enables launch testing before cutover.' },
      { id: 'b', text: 'AWS Server Migration Service (SMS) with incremental replication', correct: false, explanation: 'SMS is deprecated in favor of MGN. While SMS supported VMware migrations, MGN provides superior continuous block-level replication with shorter cutover windows and is the recommended replacement.' },
      { id: 'c', text: 'VM Import/Export to convert VMware snapshots to AMIs', correct: false, explanation: 'VM Import/Export is a manual process requiring exported OVA/VMDK files. It does not support continuous replication, progress tracking, or wave management — it is suitable only for one-off VM imports.' },
      { id: 'd', text: 'AWS DataSync to replicate VM disk images to S3, then launch EC2 instances', correct: false, explanation: 'DataSync transfers files and objects, not VM disk images for direct EC2 instantiation. It cannot replicate running VMs or orchestrate cutover testing and launch.' }
    ],
    explanation: {
      overall: 'AWS Application Migration Service (MGN) is the primary AWS migration service for lift-and-shift (rehost) of physical servers, VMs, and cloud instances. For VMware, MGN offers: agentless replication via vCenter integration (no agent needed on each VM), continuous block-level replication, wave/group management, launch settings templates, test launches (non-destructive), and automated cutover. The replication agent is installed on a dedicated replication server, not on each VM being migrated.',
      examTip: 'MGN vs DMS: MGN = server/VM migration (OS + applications, block-level replication). DMS = database migration (data-level, with schema conversion via SCT). MGN supports: VMware, Hyper-V, physical servers, and other cloud instances. MGN process: install agent → continuous replication → test launch (verify) → cutover launch (production). Target: EC2 instances. Cutover window typically < 1 hour.'
    },
    tags: ['mgn', 'application-migration-service', 'vmware', 'lift-and-shift', 'rehost']
  },
  {
    id: 'mig-004',
    stem: 'A company is assessing 500 servers for migration to AWS. They need to collect performance data, map application dependencies, identify which servers communicate with each other, and estimate AWS costs before migration. Which AWS tool provides these capabilities?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Application Discovery Service (ADS) with Discovery Agent or Agentless Discovery Connector', correct: true, explanation: 'ADS collects server inventory, performance metrics (CPU, memory, network), and network dependency mapping. Agent-based discovery provides process-level data; agentless VMware connector provides VM-level data. Results integrate with AWS Migration Hub for planning.' },
      { id: 'b', text: 'AWS Systems Manager Inventory to collect configuration data from all servers', correct: false, explanation: 'SSM Inventory collects configuration data from managed EC2 instances and on-premises servers with SSM Agent, but it does not map network dependencies or provide AWS cost estimation for migration planning.' },
      { id: 'c', text: 'AWS Trusted Advisor to analyze server configurations and recommend rightsizing', correct: false, explanation: 'Trusted Advisor analyzes existing AWS resources for optimization. It does not support on-premises server discovery, dependency mapping, or migration assessment.' },
      { id: 'd', text: 'AWS Config with custom rules to inventory on-premises servers and their relationships', correct: false, explanation: 'AWS Config tracks AWS resource configurations and relationships. It does not discover or inventory on-premises servers without SSM integration, and does not provide network dependency mapping.' }
    ],
    explanation: {
      overall: 'AWS Application Discovery Service discovers on-premises infrastructure for migration planning. Two collection methods: (1) Discovery Agent — installed on each server, collects detailed performance data and network connections (process-level granularity). (2) Agentless Discovery Connector — OVA deployed in VMware vCenter, collects VM-level data without installing agents. All data flows to Migration Hub, which provides a central view of application dependencies, migration progress, and AWS cost estimation via the Migration Evaluator.',
      examTip: 'Migration planning toolchain: ADS (discover) → Migration Hub (track) → Migration Evaluator (cost estimate) → MGN/DMS/Snowball (migrate). ADS data includes: server specs, utilization patterns (CPU/RAM/disk), network connections (which servers talk to which). Dependency mapping helps identify application tiers to migrate together. Data stored in ADS can be exported to CSV or queried via API.'
    },
    tags: ['application-discovery-service', 'migration-hub', 'dependency-mapping', 'migration-planning', 'inventory']
  },
  {
    id: 'mig-005',
    stem: 'A company wants to migrate their on-premises NFS file server (10 TB) to Amazon EFS. They need ongoing synchronization between on-premises and EFS during migration (not a one-time transfer) and want to minimize custom scripting. The migration must support incremental transfers that copy only changed files. Which service best meets these requirements?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS DataSync with an on-premises DataSync agent connecting NFS to EFS', correct: true, explanation: 'DataSync is purpose-built for online data transfer. It supports NFS as a source, EFS as a destination, incremental transfers (only changed files), scheduling for recurring transfers, bandwidth throttling, and data integrity verification. The agent runs on-premises as a VM or EC2.' },
      { id: 'b', text: 'rsync scheduled via cron from on-premises to EFS mounted via VPN', correct: false, explanation: 'While rsync supports incremental transfers, it lacks DataSync\'s managed features: no built-in scheduling UI, no transfer metrics/monitoring, no automatic retry, and requires manual infrastructure management. DataSync is the managed AWS solution.' },
      { id: 'c', text: 'AWS Storage Gateway File Gateway to present EFS as an NFS share to on-premises servers', correct: false, explanation: 'Storage Gateway File Gateway presents S3 as an NFS/SMB share — not EFS. It is designed for hybrid storage extension, not for migrating existing NFS data to EFS.' },
      { id: 'd', text: 'AWS Snowball Edge to copy the NFS data offline and import to EFS', correct: false, explanation: 'Snowball imports data to S3, not directly to EFS. For 10 TB with ongoing synchronization requirements, DataSync over the network is more appropriate and supports incremental transfers that Snowball cannot.' }
    ],
    explanation: {
      overall: 'AWS DataSync automates data transfer between: on-premises NFS/SMB/HDFS/object stores and AWS storage (S3, EFS, FSx). Key features: automatic incremental transfers, scheduling (hourly, daily, custom), built-in encryption (TLS), data validation (checksums), bandwidth throttling, CloudWatch metrics. For NFS→EFS migration: deploy DataSync agent on-premises as VM → configure NFS source location → configure EFS destination → create transfer task → schedule recurring sync during migration period → final cutover.',
      examTip: 'DataSync vs Storage Gateway: DataSync = migration/transfer tool (time-limited, moves data from A to B). Storage Gateway = ongoing hybrid access (extend on-premises storage into AWS permanently). DataSync supported sources: NFS, SMB, HDFS, self-managed object storage, S3, EFS, FSx. DataSync does NOT support EFS as a source for on-premises destinations. For bidirectional sync, create two separate DataSync tasks.'
    },
    tags: ['datasync', 'nfs', 'efs', 'file-migration', 'incremental-transfer']
  },
  {
    id: 'mig-006',
    stem: 'A company is refactoring a monolithic .NET application to microservices on AWS. They want to use the strangler fig pattern, gradually migrating features from the monolith to new microservices without disrupting users. Routing between old and new paths must be transparent to clients. Which approach best supports this pattern?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use Amazon API Gateway as a facade, routing legacy paths to the monolith on EC2 and new paths to Lambda/ECS microservices, gradually shifting routes as features are migrated', correct: true, explanation: 'API Gateway acts as the strangler fig facade. Legacy API paths proxy to the monolith (HTTP integration to EC2/ALB). New microservice paths route to Lambda or ECS. As features migrate, update API Gateway routes — clients see the same API surface throughout.' },
      { id: 'b', text: 'Deploy the microservices alongside the monolith and use Route 53 weighted routing to gradually shift traffic', correct: false, explanation: 'Route 53 weighted routing shifts all traffic for a domain — it cannot route specific API paths to different backends. The strangler fig pattern requires path-level routing granularity, which Route 53 does not provide.' },
      { id: 'c', text: 'Rewrite the entire application at once using the big bang migration approach', correct: false, explanation: 'Big bang migration is the opposite of the strangler fig pattern. It carries high risk (entire system must work before any users can access), extended downtime, and no incremental validation.' },
      { id: 'd', text: 'Use CloudFront with Lambda@Edge to inspect request paths and route to different origins', correct: false, explanation: 'While technically possible, this adds unnecessary complexity. API Gateway is purpose-built for API routing with fine-grained path controls, authentication, throttling, and monitoring — making it better suited for the strangler fig pattern.' }
    ],
    explanation: {
      overall: 'The strangler fig pattern gradually replaces a monolith by routing specific features to new microservices while keeping the rest in the monolith — until the monolith is completely replaced. API Gateway is the ideal facade because: (1) HTTP integrations proxy requests to existing monolith, (2) New routes integrate with Lambda/ECS/Fargate microservices, (3) Path-based routing provides feature-level granularity, (4) Clients see a single API endpoint throughout the migration, (5) Gradual migration reduces risk.',
      examTip: 'Strangler fig pattern key components: Facade (API Gateway/ALB), old system (monolith), new services. Gradual migration: route → new service per feature, decommission monolith feature by feature. AWS services supporting this: API Gateway (best for REST/HTTP APIs), ALB with path-based rules (for non-API workloads), CloudFront with behaviors. Pattern advantage: rollback is just a routing change, not a full deployment.'
    },
    tags: ['strangler-fig', 'api-gateway', 'microservices', 'migration-pattern', 'refactoring']
  },
  {
    id: 'mig-007',
    stem: 'A company needs to migrate petabyte-scale data (5 PB) from an on-premises data center to Amazon S3. The data center has limited internet connectivity (100 Mbps). Physical shipping of devices is not feasible due to data sensitivity requirements. They have a Direct Connect connection that is used for production traffic. What is the most appropriate solution?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS DataSync over Direct Connect with a dedicated virtual interface, throttled to avoid impacting production traffic', correct: true, explanation: 'DataSync over Direct Connect provides a secure, high-bandwidth path for large transfers. With a dedicated private VIF, migration traffic is separated from production. DataSync supports bandwidth throttling to prevent saturation during business hours.' },
      { id: 'b', text: 'Order AWS Snowmobile to physically transfer 5 PB in a shipping container', correct: false, explanation: 'The question states physical shipping is not feasible due to data sensitivity. Snowmobile would be appropriate for this scale otherwise, but the constraint eliminates this option.' },
      { id: 'c', text: 'Use S3 Transfer Acceleration over the 100 Mbps internet connection', correct: false, explanation: 'At 100 Mbps, 5 PB would take ~4.6 years (100 Mbps ÷ 8 = 12.5 MB/s; 5 PB / 12.5 MB/s = 400M seconds). Transfer Acceleration optimizes routing but cannot overcome the fundamental bandwidth limitation.' },
      { id: 'd', text: 'Use multiple Snowball Edge devices and ship through a secure courier', correct: false, explanation: 'The constraint is that physical shipping is not feasible due to data sensitivity. Even though Snowball Edge devices are encrypted, the requirement eliminates physical transfer options.' }
    ],
    explanation: {
      overall: 'When physical transfer is not allowed and internet bandwidth is insufficient, Direct Connect is the solution for large-scale migrations. A dedicated Direct Connect virtual interface (VIF) for migration separates migration traffic from production. With a 10 Gbps DX connection, 5 PB could be transferred in ~46 days. DataSync over DX provides: encryption in transit, data validation, incremental transfers, and bandwidth throttling. For even faster transfer, request additional DX capacity or use DX with LAG (Link Aggregation Group).',
      examTip: 'Transfer time calculation: 5 PB = 5,000 TB = 5,000,000 GB. At 10 Gbps = 1.25 GB/s = 4,500 GB/hr = 108 TB/day. 5,000,000 GB / 108,000 GB/day ≈ 46 days. DataSync maximizes DX utilization with parallel streams. For DX + DataSync: use private VIF → transit gateway or DX gateway → VPC with DataSync endpoint → S3 or EFS destination. Always use DataSync over DX for managed, validated large transfers.'
    },
    tags: ['datasync', 'direct-connect', 'large-scale-migration', 's3', 'petabyte']
  },
  {
    id: 'mig-008',
    stem: 'A company is migrating from AWS to a third-party cloud. They need to export all their AWS resource configurations and data. Which services would be involved in exporting EC2 AMIs, RDS snapshots, and S3 data? (Select TWO)',
    type: 'multiple',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'VM Export to convert EC2 AMIs/instances to OVA/VMDK format for third-party hypervisors', correct: true, explanation: 'AWS VM Export converts EC2 instances or AMIs to OVA, VMDK, or VHD format compatible with VMware, Hyper-V, and other hypervisors. The exported files are stored in S3 before being downloaded.' },
      { id: 'b', text: 'AWS DataSync to transfer S3 bucket contents to an external storage endpoint', correct: true, explanation: 'DataSync supports S3 as a source and can transfer to NFS/SMB servers outside AWS. For migration from AWS, DataSync can efficiently export S3 data to on-premises or third-party destinations with incremental transfers.' },
      { id: 'c', text: 'AWS MGN to migrate EC2 instances to third-party cloud', correct: false, explanation: 'MGN migrates servers TO AWS, not FROM AWS. It is a one-directional tool for bringing workloads into AWS.' },
      { id: 'd', text: 'AWS DMS to export RDS database schemas and data to any database engine', correct: false, explanation: 'While DMS can migrate FROM RDS to external databases, migrating FROM AWS is not its primary use case. DMS does support heterogeneous exports, but the question asked about which services are involved — DMS is less commonly used for AWS-exit scenarios.' }
    ],
    explanation: {
      overall: 'Migrating FROM AWS requires: (1) VM Export for EC2 instances/AMIs → OVA/VMDK/VHD files for third-party hypervisors. (2) RDS snapshot export to S3 as Parquet, then use a tool to import to target database. (3) DataSync or S3 batch operations for S3 data export. (4) Direct Connect or internet for data transfer. Note: there is no comprehensive AWS "exit" toolkit — exiting AWS requires using various individual services for each resource type.',
      examTip: 'VM Import/Export: Import = VMDK/OVA/VHD → EC2 AMI (bring VMs to AWS). Export = EC2 instance/AMI → VMDK/OVA/VHD (take VMs from AWS). Not all AMIs support export (marketplace AMIs, encrypted AMIs may not be exportable). RDS export: snapshot → S3 as Parquet using "Export to Amazon S3" feature. S3 export: DataSync or aws s3 sync to external destination.'
    },
    tags: ['vm-export', 'datasync', 'cloud-migration', 'egress', 'interoperability']
  },
  {
    id: 'mig-009',
    stem: 'A retail company is migrating their e-commerce platform to AWS before the holiday season. The migration involves 50 servers across 3 application tiers (web, app, database). They want to migrate in groups (waves), validate each wave before proceeding, and have a central dashboard to track overall migration progress. Which AWS service provides this orchestration capability?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Migration Hub to track migration progress across tools and waves', correct: true, explanation: 'Migration Hub provides a central dashboard that aggregates migration status from multiple AWS migration tools (MGN, DMS, SMS). It supports application grouping and wave planning, showing which servers are discovered, migrating, or migrated.' },
      { id: 'b', text: 'AWS Control Tower to orchestrate the migration across multiple AWS accounts', correct: false, explanation: 'Control Tower manages multi-account AWS environments with governance guardrails. It does not track or orchestrate application migrations from on-premises to AWS.' },
      { id: 'c', text: 'AWS Systems Manager OpsCenter to track migration tasks and server status', correct: false, explanation: 'OpsCenter is an IT operations tracking tool for operational issues (OpsItems). It is not designed for migration wave planning or aggregating migration status from MGN/DMS.' },
      { id: 'd', text: 'Amazon CloudWatch dashboards to monitor migration progress metrics', correct: false, explanation: 'CloudWatch monitors metrics but does not understand migration concepts like waves, server groups, or migration status. It would show replication metrics but not provide migration orchestration.' }
    ],
    explanation: {
      overall: 'AWS Migration Hub is the central tracking service for migrations. It integrates with: MGN (server replication status), DMS (database migration status), ADS (discovery data), and partner tools. Features: application grouping (logical groups of servers), migration tracking (discovered → in-progress → migrated), wave management, and per-application progress dashboard. Migration Hub home region must be selected before starting — it cannot be changed after.',
      examTip: 'Migration Hub vs individual migration services: Hub = tracking and orchestration layer. MGN = actual server replication engine. DMS = database migration engine. ADS = discovery. These tools report status TO Migration Hub but operate independently. Migration Hub home region selection is a one-time configuration — choose carefully. Available integrations: CloudEndure/MGN, DMS, Server Migration Service (legacy), and partner tools.'
    },
    tags: ['migration-hub', 'migration-orchestration', 'wave-planning', 'tracking', 'mgn']
  },
  {
    id: 'mig-010',
    stem: 'A company is running an on-premises MySQL database (1 TB) and wants to migrate to Amazon Aurora MySQL with minimal code changes. They need a way to continuously replicate from on-premises to Aurora during the migration period, with the option to fail back to on-premises if issues arise after cutover. Which approach supports both migration and failback?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS DMS with bidirectional replication between on-premises MySQL and Aurora MySQL', correct: false, explanation: 'DMS does not support bidirectional CDC replication for MySQL → MySQL. While DMS can replicate from MySQL to Aurora, setting up reverse replication for failback requires a separate DMS task and is not a simple checkbox.' },
      { id: 'b', text: 'Configure native MySQL binary log (binlog) replication from on-premises to Aurora MySQL, and configure Aurora as a replication source for failback', correct: true, explanation: 'Aurora MySQL supports native MySQL binlog replication. Configure on-premises MySQL as the master, Aurora as a replica (read-only during migration). After cutover, promote Aurora to master and point the binlog replica back to Aurora for potential failback.' },
      { id: 'c', text: 'Use RDS Blue/Green Deployments to create an Aurora replica of the on-premises database', correct: false, explanation: 'RDS Blue/Green Deployments create replicas within RDS/Aurora — it does not reach out to on-premises databases. It is used for schema changes/version upgrades within AWS, not for initial migration.' },
      { id: 'd', text: 'Use AWS Database Migration Service with full-load only mode and restore from backup for failback', correct: false, explanation: 'Full-load-only DMS does not support failback — there is no ongoing replication. Restoring from backup introduces RPO equal to the backup age, which may be unacceptable.' }
    ],
    explanation: {
      overall: 'Native MySQL replication (binlog) between on-premises MySQL and Amazon Aurora MySQL is possible because Aurora MySQL is wire-compatible with MySQL. Setup: enable binlog on on-premises MySQL, create Aurora MySQL cluster, initiate replication using CHANGE MASTER TO pointing to on-premises. Aurora replicates as a read replica. For cutover: stop writes to on-premises, promote Aurora, update application connection strings. For failback capability: after promotion, configure reverse replication from Aurora to on-premises standby.',
      examTip: 'Aurora MySQL binlog replication: Aurora can be a replica of external MySQL (and vice versa). This enables: migration with minimal downtime, hybrid active-passive configurations, and incremental migration. Requirements: on-premises MySQL must have binary logging enabled, port 3306 accessible from AWS (via VPN/DX), sufficient network bandwidth. DMS is also valid for this scenario but native binlog gives more control over failback topology.'
    },
    tags: ['aurora-mysql', 'binlog-replication', 'database-migration', 'failback', 'mysql']
  },
  {
    id: 'mig-011',
    stem: 'A company wants to modernize their on-premises Windows file shares to AWS. Users access files via SMB protocol from Windows workstations. During migration, users must continue accessing files without reconfiguring workstations. After migration, files should be served from AWS with high durability. What is the recommended architecture?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Deploy AWS Storage Gateway File Gateway on-premises to present S3 as SMB shares, migrate files to S3, then eventually transition to Amazon FSx for Windows File Server', correct: true, explanation: 'File Gateway provides immediate SMB access backed by S3 (transparent to users). Files are migrated to S3 via File Gateway without reconfiguring workstations. Eventually, migrate to FSx for Windows for native Windows features (AD integration, DFS, shadow copies).' },
      { id: 'b', text: 'Use AWS DataSync to copy files from on-premises SMB to Amazon EFS, then mount EFS on Windows workstations', correct: false, explanation: 'EFS uses NFS protocol (not SMB) and does not natively support Windows workstations without additional NFS client software. FSx for Windows or Storage Gateway are better suited for Windows SMB workloads.' },
      { id: 'c', text: 'Create Amazon FSx for Windows File Server, use DataSync to migrate files, then update DNS to point to FSx', correct: false, explanation: 'This requires a DNS cutover that temporarily disrupts access. The question requires zero reconfiguration for workstations during migration. Storage Gateway provides a transparent bridge during migration.' },
      { id: 'd', text: 'Deploy a Windows EC2 instance as a file server with shared drives accessible via SMB from on-premises', correct: false, explanation: 'Self-managed EC2 file servers require operational overhead and do not provide the managed service benefits of FSx or Storage Gateway. This is not the recommended AWS approach.' }
    ],
    explanation: {
      overall: 'AWS Storage Gateway File Gateway provides an SMB-compatible, on-premises accessible interface backed by S3. During migration: (1) Deploy File Gateway appliance on-premises, (2) Present S3 as SMB file share, (3) Users connect to File Gateway (same SMB protocol, no reconfiguration), (4) Migrate files from old server to File Gateway (DataSync or robocopy), (5) Decommission old server. Post-migration option: create FSx for Windows, migrate from S3 to FSx, update DNS — users still see SMB with no workstation changes.',
      examTip: 'Storage Gateway types: File Gateway = S3 backed NFS/SMB (hybrid storage). Volume Gateway = iSCSI block storage backed by S3. Tape Gateway = virtual tape library backed by S3 Glacier. For Windows SMB → AWS: FSx for Windows = fully managed Windows file server (AD, DFS, shadow copies, SMB 3.x). File Gateway = transparent SMB bridge to S3 for gradual migration. DataSync = bulk migration tool for files (NFS/SMB source to S3/EFS/FSx destination).'
    },
    tags: ['storage-gateway', 'file-gateway', 'fsx-windows', 'smb', 'file-migration']
  },
  {
    id: 'mig-012',
    stem: 'A company has completed their migration to AWS. They now want to optimize costs by rightsizing EC2 instances based on actual utilization. They have 300 EC2 instances across multiple accounts in an AWS Organization. Which service provides rightsizing recommendations considering performance history?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Compute Optimizer with EC2 rightsizing recommendations based on CloudWatch metrics', correct: true, explanation: 'Compute Optimizer analyzes historical CloudWatch metrics (CPU, memory with CloudWatch Agent, network, disk) and provides rightsizing recommendations for EC2 instances, Auto Scaling groups, Lambda functions, and EBS volumes. Supports organization-wide analysis.' },
      { id: 'b', text: 'AWS Cost Explorer rightsizing recommendations', correct: false, explanation: 'Cost Explorer has a basic rightsizing recommendation feature, but it is less comprehensive than Compute Optimizer. Compute Optimizer uses ML-based analysis with configurable lookback periods and provides more detailed recommendations.' },
      { id: 'c', text: 'AWS Trusted Advisor EC2 optimization checks', correct: false, explanation: 'Trusted Advisor provides high-level optimization checks but does not provide the deep ML-based rightsizing analysis that Compute Optimizer offers. Trusted Advisor recommendations are broader and less granular.' },
      { id: 'd', text: 'AWS Config with EC2 instance type compliance rules', correct: false, explanation: 'Config tracks configuration changes and enforces compliance rules. It does not analyze performance metrics for rightsizing recommendations.' }
    ],
    explanation: {
      overall: 'AWS Compute Optimizer uses machine learning to analyze resource utilization patterns and recommend optimal AWS resource configurations. For EC2: analyzes 14 days of CloudWatch metrics (up to 3 months with enhanced recommendations), considers CPU, memory (requires CloudWatch Agent), network, and EBS throughput. Recommendations: under-provisioned (risk), over-provisioned (cost savings), optimized. For memory-based recommendations, you must install the CloudWatch Agent to collect memory metrics (EC2 does not export memory by default).',
      examTip: 'Compute Optimizer vs Cost Explorer rightsizing: Compute Optimizer = ML-based, detailed, considers performance risk, supports EC2/ASG/Lambda/EBS/ECS Fargate/RDS. Cost Explorer = simpler, cost-focused, EC2 only. Enable Compute Optimizer at Organization level to get recommendations across all accounts. Compute Optimizer requires opt-in — it is not automatic. Enhanced recommendations (3-month lookback) require Compute Optimizer paid tier.'
    },
    tags: ['compute-optimizer', 'rightsizing', 'cost-optimization', 'ec2', 'organization']
  },
  {
    id: 'mig-013',
    stem: 'A company is performing a heterogeneous database migration from Microsoft SQL Server to Amazon Aurora PostgreSQL. The database has stored procedures, triggers, and views using SQL Server-specific syntax. Before using DMS for data migration, they need to convert the database schema and objects. Which tool assists with this conversion?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Schema Conversion Tool (SCT) to convert SQL Server schema, stored procedures, and views to PostgreSQL-compatible syntax', correct: true, explanation: 'AWS SCT analyzes the source database schema and automatically converts objects (tables, views, stored procedures, functions, triggers) to the target database engine. It flags items requiring manual conversion and provides an assessment report estimating migration complexity.' },
      { id: 'b', text: 'AWS DMS schema conversion feature during the migration task', correct: false, explanation: 'DMS migrates data but does not perform schema conversion. DMS Schema Conversion (a newer feature) provides some basic schema conversion but SCT is the primary and more comprehensive tool for complex heterogeneous migrations.' },
      { id: 'c', text: 'AWS RDS schema migration wizard in the console', correct: false, explanation: 'There is no "RDS schema migration wizard." Schema conversion requires AWS SCT, which is a downloadable application that runs locally and analyzes source database objects.' },
      { id: 'd', text: 'AWS Glue ETL jobs to transform SQL Server stored procedures to Python', correct: false, explanation: 'AWS Glue is an ETL service for data transformation and analytics pipelines, not for database schema conversion. It does not convert stored procedures between database engines.' }
    ],
    explanation: {
      overall: 'AWS Schema Conversion Tool (SCT) is a free downloadable tool that: (1) Connects to the source database (SQL Server, Oracle, MySQL, etc.), (2) Analyzes schema objects and generates an assessment report with conversion complexity estimates, (3) Automatically converts compatible objects to the target database syntax, (4) Flags objects requiring manual conversion with explanations. For SQL Server → Aurora PostgreSQL: SCT handles schema structure, DMS handles data migration.',
      examTip: 'Heterogeneous migration workflow: SCT (schema conversion) → DMS (data migration + CDC). SCT supports many source/target pairs: Oracle/SQL Server/MySQL → PostgreSQL/Aurora/MySQL. SCT conversion report shows: automatic conversion %, manual action required items, and estimated effort. After SCT conversion, deploy schema to target database BEFORE starting DMS migration task. SCT is client-side software — download from AWS, not a cloud service.'
    },
    tags: ['sct', 'schema-conversion-tool', 'heterogeneous-migration', 'sql-server', 'aurora-postgresql']
  },
  {
    id: 'mig-014',
    stem: 'A company is using AWS for 18 months and wants to reduce costs. They have many EC2 instances running 24/7 with predictable workloads, and unused EBS volumes, old snapshots, and idle load balancers. They want a single service that identifies all these cost-saving opportunities. Which service provides the most comprehensive cost optimization recommendations?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Cost Explorer with Reserved Instance recommendations and rightsizing reports', correct: false, explanation: 'Cost Explorer provides RI recommendations and basic rightsizing, but does not identify unused EBS volumes, idle load balancers, or snapshots. It is cost analytics-focused, not a comprehensive optimization scanner.' },
      { id: 'b', text: 'AWS Trusted Advisor with checks for cost optimization, performance, security, and fault tolerance', correct: true, explanation: 'Trusted Advisor scans AWS accounts for optimization opportunities across multiple categories. Cost checks include: idle EC2 instances, underutilized EBS volumes, unassociated EIPs, idle load balancers, old EBS snapshots, low utilization EC2 instances, and Reserved Instance purchase recommendations.' },
      { id: 'c', text: 'AWS Config with cost optimization conformance packs', correct: false, explanation: 'Config tracks resource configurations for compliance but does not proactively identify cost optimization opportunities like idle resources or underutilized instances.' },
      { id: 'd', text: 'AWS Systems Manager Explorer to aggregate cost data across the organization', correct: false, explanation: 'SSM Explorer provides operational data aggregation for operations management, not cost optimization scanning. It does not analyze resource utilization for cost savings.' }
    ],
    explanation: {
      overall: 'AWS Trusted Advisor continuously evaluates AWS environments against best practices across five categories: Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits. Cost checks include: idle/underutilized EC2 instances, EBS volumes with no read/write activity, EIPs not associated with running instances, idle load balancers (< 5 requests/day), old EBS snapshots, overprovisioned service limits. Full Trusted Advisor access requires Business or Enterprise Support plan. Basic support provides limited checks.',
      examTip: 'Trusted Advisor check categories: Cost Optimization, Performance, Security, Fault Tolerance, Service Limits. Full checks require Business or Enterprise Support. For automated responses to Trusted Advisor findings: use EventBridge + Lambda to automatically remediate (e.g., delete unassociated EIPs, notify about idle resources). Trusted Advisor data available via AWS Support API for programmatic access and custom dashboards.'
    },
    tags: ['trusted-advisor', 'cost-optimization', 'idle-resources', 'ebs', 'load-balancer']
  },
  {
    id: 'mig-015',
    stem: 'A company is planning to migrate from on-premises to AWS. Their executive team wants a detailed business case with projected AWS costs vs current on-premises costs, Total Cost of Ownership (TCO) analysis, and migration savings estimates before committing to the migration. Which AWS tool provides this analysis?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'migration',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'AWS Migration Evaluator (formerly TSO Logic) to create a business case with TCO analysis', correct: true, explanation: 'Migration Evaluator collects on-premises configuration and cost data (infrastructure, power, facilities, labor) and generates a detailed business case comparing current TCO vs projected AWS costs, including optimization recommendations like Reserved Instances and right-sizing.' },
      { id: 'b', text: 'AWS Pricing Calculator to estimate monthly AWS costs for the equivalent workloads', correct: false, explanation: 'Pricing Calculator estimates AWS costs but does not compare against on-premises costs or perform TCO analysis. It lacks the business case generation and comparative analysis features of Migration Evaluator.' },
      { id: 'c', text: 'AWS Cost Explorer to project future AWS costs based on current usage', correct: false, explanation: 'Cost Explorer analyzes existing AWS costs and usage — it requires you to already be on AWS. It cannot analyze on-premises infrastructure costs or generate migration business cases.' },
      { id: 'd', text: 'AWS Application Discovery Service to collect data and generate migration cost estimates', correct: false, explanation: 'ADS collects inventory and performance data for migration planning but does not generate TCO analysis or business cases. ADS data feeds into Migration Evaluator for the cost analysis.' }
    ],
    explanation: {
      overall: 'AWS Migration Evaluator (formerly TSO Logic) is a free service for building migration business cases. It can: (1) Analyze existing on-premises infrastructure data (from ADS, RVTools, or manual input), (2) Calculate current TCO including hardware, power, cooling, facilities, and labor costs, (3) Project AWS costs with optimization (Reserved Instances, right-sizing), (4) Generate a detailed report showing 3-5 year savings. AWS Solutions Architects use Migration Evaluator to justify migration investments to executive stakeholders.',
      examTip: 'Migration toolchain by phase: ASSESS (ADS, Migration Evaluator) → MOBILIZE (SCT schema analysis, MGN agent installation) → MIGRATE (MGN, DMS, DataSync, Snowball) → OPTIMIZE (Compute Optimizer, Trusted Advisor, Cost Explorer). Migration Evaluator = business case/TCO analysis for pre-migration justification. AWS Pricing Calculator = cost estimation for new AWS architectures. These are different tools for different purposes.'
    },
    tags: ['migration-evaluator', 'tco', 'business-case', 'cost-analysis', 'migration-planning']
  },
  {
    id: 'mig-016',
    stem: 'A company is migrating 500 virtual machines from VMware vSphere on-premises to AWS using AWS Application Migration Service (MGN). They need to minimize the cutover window to under 2 hours for business-critical servers. During testing, they noticed that the initial replication of a 4 TB VM took 18 hours and subsequent changes replicate in near-real-time. What is the correct sequence for a minimal-downtime cutover using MGN?',
    type: 'single', difficulty: 2, topicSlug: 'migration', examDomain: 'migration-modernization',
    options: [
      { id: 'a', text: 'Stop the source VM → Start replication → Wait for full sync → Launch test instance → Launch cutover instance', correct: false, explanation: 'Stopping the source VM before replication means the application is offline for the entire 18-hour initial replication period. This creates massive downtime, not a minimal cutover window.' },
      { id: 'b', text: 'Install MGN agent → Allow continuous replication → Launch test instance → Validate → Finalize cutover (brief downtime only for final delta sync)', correct: true, explanation: 'MGN continuous replication: install agent on source → initial full replication (18h, source stays online) → near-real-time delta replication ongoing → when ready: launch test instance, validate, then initiate cutover. Cutover: source VM stopped → final delta sync (~minutes) → cutover instance launched. Downtime = only the final delta sync time, typically minutes to under an hour.' },
      { id: 'c', text: 'Use Snowball Edge to perform the initial bulk data transfer, then configure MGN for delta changes only', correct: false, explanation: 'MGN does not support Snowball Edge for initial seeding. Snowball is used for large-scale data transfer to S3, not for VM replication workflows with MGN. MGN performs its own initial replication over the network.' },
      { id: 'd', text: 'Launch the cutover instance immediately after agent installation, then allow MGN to synchronize data to the running instance', correct: false, explanation: 'MGN does not synchronize data to a running cutover instance. The cutover instance is launched from a snapshot taken at cutover initiation. You must allow replication to complete and validate with a test instance before cutting over.' },
    ],
    explanation: { overall: 'AWS MGN (Application Migration Service) workflow: (1) Install MGN replication agent on source servers (Windows/Linux). (2) Initial replication — full disk copy to staging area in AWS (uses EBS, network transfer, source stays online). (3) Continuous replication — ongoing block-level changes synced in near-real-time. (4) Test — launch test instance from replicated data; validate app functionality; no production impact. (5) Cutover — schedule maintenance window: stop source, final sync completes in minutes, launch production cutover instance, validate, redirect traffic. Total downtime = final sync duration only.', examTip: 'MGN vs DMS vs DataSync: MGN = lift-and-shift VM migration (replicate entire OS + data volumes, agent-based). DMS = database migration with optional schema conversion, supports heterogeneous engines. DataSync = file/object storage migration (NFS/SMB/S3/EFS/FSx). Key MGN differentiator: near-zero-downtime cutover because replication is continuous and the cutover window only includes the final delta sync. MGN replaced Server Migration Service (SMS) — SMS is deprecated.' },
    tags: ['mgn', 'application-migration-service', 'replication', 'cutover', 'lift-and-shift'],
  },
  {
    id: 'mig-017',
    stem: 'A company is modernizing a monolithic Java EE application to microservices on AWS. The application has 15 tightly coupled modules sharing a single Oracle database. The team wants to migrate with minimal risk, keeping the monolith functional while incrementally extracting modules. They plan to start with the inventory module. Which migration pattern should they follow, and what AWS services support the database decoupling?',
    type: 'multiple', difficulty: 3, topicSlug: 'migration', examDomain: 'migration-modernization',
    options: [
      { id: 'a', text: 'Apply the Strangler Fig pattern — route new inventory requests to a new microservice while the monolith handles remaining modules', correct: true, explanation: 'The Strangler Fig pattern incrementally replaces monolith functionality by routing specific requests to new services. The monolith continues to serve all other modules. Over time, modules are extracted until the monolith is retired. This enables zero-downtime, low-risk incremental modernization.' },
      { id: 'b', text: 'Use Amazon API Gateway as a facade to route /inventory/* requests to the new ECS-based microservice and all other paths to the existing monolith', correct: true, explanation: 'API Gateway acts as the strangler proxy, routing /inventory/* to the new microservice (on ECS/Lambda) while other paths still route to the monolith. This provides a clean traffic split without requiring client application changes.' },
      { id: 'c', text: 'Rewrite all 15 modules simultaneously as microservices before migrating any to production (big bang rewrite)', correct: false, explanation: 'A big-bang rewrite has high risk — the new system must be 100% complete and tested before any production traffic moves. It extends the migration timeline by months/years and risks feature regression. The Strangler Fig pattern is preferred for risk reduction.' },
      { id: 'd', text: 'Use DMS to replicate inventory-related Oracle tables to Aurora PostgreSQL, enabling the new inventory microservice to use its own isolated database', correct: true, explanation: 'Database decoupling is critical for microservice independence. DMS CDC replication from Oracle to Aurora PostgreSQL keeps the new microservice database in sync with the monolith during the transition. After full cutover of the inventory module, DMS replication is stopped and the monolith no longer writes to inventory tables.' },
    ],
    explanation: { overall: 'Modernization patterns: (1) Strangler Fig — incremental extraction, monolith stays operational. (2) Big Bang Rewrite — high risk, rewrite everything before migrating. (3) Lift and Shift → then modernize (two-phase). For the Strangler Fig with Oracle: use DMS CDC to replicate the Oracle tables used by the target microservice to a new Aurora/RDS database. The microservice reads/writes its own database; DMS keeps it in sync with Oracle during the transition. After cutover, DMS is stopped and the monolith\'s Oracle tables for that module are decommissioned.', examTip: 'Strangler Fig on AWS: API Gateway (routing facade) + ALB path-based routing + Route 53 weighted routing are common proxy mechanisms. Database decomposition patterns: Database-per-Service (each microservice owns its DB), CQRS (separate read/write models), Saga pattern (distributed transactions). DMS: supports Oracle → Aurora PostgreSQL heterogeneous migration with SCT for schema conversion + DMS for data/CDC replication. Identify tables by microservice domain before migration.' },
    tags: ['strangler-fig', 'modernization', 'microservices', 'dms', 'api-gateway'],
  },
  {
    id: 'mig-018',
    stem: 'A company needs to transfer 2 PB of archival data from an on-premises tape library to AWS for long-term storage. The data is rarely accessed but must be retained for compliance for 10 years. The company has a 1 Gbps internet connection shared with production traffic. An initial transfer estimate shows network transfer alone would take over 180 days. Which AWS service and storage class combination provides the most cost-effective and time-efficient solution?',
    type: 'single', difficulty: 2, topicSlug: 'migration', examDomain: 'migration-modernization',
    options: [
      { id: 'a', text: 'AWS DataSync over the existing internet connection to Amazon S3 Glacier Deep Archive', correct: false, explanation: 'DataSync over a 1 Gbps shared internet connection would take 180+ days to transfer 2 PB, as originally calculated. DataSync optimizes throughput but is bounded by available bandwidth.' },
      { id: 'b', text: 'Multiple AWS Snowball Edge Storage Optimized devices (80 TB usable each) shipped in parallel to Amazon S3, then lifecycle transition to S3 Glacier Deep Archive', correct: true, explanation: 'For 2 PB, you need ~25 Snowball Edge devices (each 80 TB usable). AWS ships multiple devices simultaneously. Each device is physically transported, eliminating network bandwidth constraints. Data lands in S3 Standard, then an S3 lifecycle policy transitions it to S3 Glacier Deep Archive ($0.00099/GB/month) after upload. Total time: typically 1-3 weeks including shipping cycles.' },
      { id: 'c', text: 'AWS Snowmobile (100 PB capacity exabyte-scale transfer truck) to Amazon S3 Glacier', correct: false, explanation: 'Snowmobile is designed for exabyte-scale migrations (100 PB capacity). For 2 PB, Snowball Edge devices are more appropriate and cost-effective. Snowmobile has significant minimum commitment and setup requirements.' },
      { id: 'd', text: 'AWS Direct Connect 10 Gbps dedicated connection to transfer directly to Amazon S3 Glacier Deep Archive', correct: false, explanation: 'A 10 Gbps Direct Connect would take approximately 18 days for 2 PB (theoretical maximum). However, provisioning Direct Connect takes weeks, it has ongoing monthly costs (port fees + data transfer), and for a one-time migration is significantly more expensive than Snowball. Snowball is the more cost-effective choice for one-time bulk transfers over ~10 TB.' },
    ],
    explanation: { overall: 'AWS data transfer decision framework: <10 GB = internet fine; <10 TB = consider Snowball; 10 TB–10 PB = Snowball Edge (80 TB usable/device); >10 PB = Snowmobile. For 2 PB: ~25 Snowball Edge devices. Process: request devices → copy data → ship back → AWS uploads to S3 → lifecycle to Glacier Deep Archive. Cost comparison: Snowball = device rental + shipping (one-time); Direct Connect = port hours + data transfer (ongoing); Internet = data transfer charges. For archival, Glacier Deep Archive at $0.00099/GB is the lowest-cost storage tier.', examTip: 'Snowball Edge variants: Storage Optimized (80 TB usable, 40 vCPU) — bulk data migration. Compute Optimized (28 TB NVMe + 52 TB HDD usable, GPU optional) — edge computing + storage. Snowball classic (50 TB/80 TB) is retired; Snowball Edge is current. Snowball → S3 Standard (then lifecycle to Glacier via policy). Cannot send Snowball data directly to Glacier without first staging in S3.' },
    tags: ['snowball-edge', 'data-migration', 'glacier-deep-archive', 'large-scale-transfer', 'tape-migration'],
  },
  {
    id: 'mig-019',
    stem: 'A retail company is migrating a Microsoft SQL Server 2014 database (10 TB) to AWS. The database uses SQL Server-specific features: SSAS (Analysis Services), SSRS (Reporting Services), linked servers, and CLR stored procedures. The company wants to minimize licensing costs and reduce administrative overhead. Which migration target and approach is most appropriate?',
    type: 'single', difficulty: 3, topicSlug: 'migration', examDomain: 'migration-modernization',
    options: [
      { id: 'a', text: 'Migrate to Amazon RDS for SQL Server (Enterprise Edition) to maintain full SQL Server feature compatibility', correct: false, explanation: 'RDS for SQL Server supports many SQL Server features but has notable limitations: no SSAS (Analysis Services), no SSRS (Reporting Services), limited CLR support, and no linked server support to external sources outside AWS. These missing features would require application changes.' },
      { id: 'b', text: 'Lift and shift to SQL Server on EC2 with Bring Your Own License (BYOL) to maintain all features, then evaluate modernization', correct: true, explanation: 'EC2 SQL Server (BYOL) supports ALL SQL Server features including SSAS, SSRS, linked servers, and CLR. This is the correct "lift and shift" choice for SQL Server with advanced feature dependencies. BYOL with existing on-premises SA (Software Assurance) licenses is cost-effective. The company can then evaluate modernization (migrate SSRS to QuickSight, SSAS to Redshift) in a separate phase.' },
      { id: 'c', text: 'Use AWS SCT to convert SQL Server to Aurora PostgreSQL and migrate CLR procedures to PL/pgSQL', correct: false, explanation: 'Heterogeneous migration from SQL Server to Aurora PostgreSQL is viable for simple databases but SSAS, SSRS, and CLR stored procedures have no direct PostgreSQL equivalents. SCT would flag these as manual conversion items requiring significant re-engineering, not a simple migration.' },
      { id: 'd', text: 'Migrate to Amazon Redshift for the database and Amazon QuickSight for reporting to eliminate SQL Server entirely', correct: false, explanation: 'Redshift is an analytics data warehouse, not an OLTP replacement. Moving a 10 TB operational SQL Server database to Redshift would require major application refactoring. This is a modernization initiative, not a migration. For the initial migration phase, maintaining SQL Server is appropriate.' },
    ],
    explanation: { overall: 'SQL Server migration path decision: (1) Full feature compatibility needed (SSAS, SSRS, CLR, linked servers) → SQL Server on EC2 (BYOL or License Included). (2) Standard SQL Server features only (most applications) → RDS for SQL Server (managed, auto-patching, automated backups, Multi-AZ). (3) Long-term cost reduction goal → SCT + DMS to heterogeneous target (Aurora PostgreSQL, MySQL). (4) Analytics/reporting → QuickSight + Redshift. BYOL benefit: use existing on-premises SQL Server licenses with active SA on EC2, significant cost savings vs License Included.', examTip: 'RDS for SQL Server limitations (know these for exam): No SSAS (Analysis Services), No SSRS (Reporting Services), No SQL Server Agent full functionality, limited CLR, no linked servers to non-RDS sources, no cross-database transactions across different RDS instances. RDS SQL Server supports: Always On Availability Groups (Multi-AZ), Transparent Data Encryption, IAM authentication, automated backups. When exam question mentions SSAS/SSRS/linked servers → EC2 is the answer.' },
    tags: ['sql-server', 'rds', 'ec2', 'byol', 'database-migration'],
  },
  {
    id: 'mig-020',
    stem: 'A company is completing a large-scale migration of 1,200 servers using AWS Migration Hub. After migration, they need to track which migrated servers are in production, which are in testing, and which are decommissioned. They also need to generate executive reports showing migration progress by business unit. Which AWS Migration Hub capability enables this tracking and reporting?',
    type: 'single', difficulty: 2, topicSlug: 'migration', examDomain: 'migration-modernization',
    options: [
      { id: 'a', text: 'AWS Application Discovery Service (ADS) agentless discovery for ongoing server inventory tracking post-migration', correct: false, explanation: 'ADS is designed for pre-migration discovery and dependency mapping — identifying what you have before migration. It is not designed for post-migration status tracking and executive reporting during or after the migration project.' },
      { id: 'b', text: 'AWS Migration Hub tracking with application grouping and migration status updates from integrated migration tools (MGN, DMS), plus Migration Hub Strategy Recommendations for modernization planning', correct: false, explanation: 'Migration Hub does track server and application migration status, but Migration Hub Strategy Recommendations is a separate service for analyzing migrated applications and recommending modernization strategies — not for executive business unit reporting.' },
      { id: 'c', text: 'AWS Migration Hub with application groupings tagged by business unit, migration status tracking per server, and Migration Hub home region for centralized reporting across all discovery and migration tools', correct: true, explanation: 'Migration Hub provides: (1) Application groupings — logical groups of servers by business unit or application. (2) Status tracking — Not Started, In Progress, Completed per server and application. (3) Integration with MGN, DMS, CloudEndure — these tools report status updates to Migration Hub automatically. (4) Home region — single pane of glass for all migration activity. Business unit tags on application groups enable filtered executive reporting.' },
      { id: 'd', text: 'AWS Systems Manager Inventory with custom metadata fields for migration status, queried via AWS Config aggregator for multi-account reporting', correct: false, explanation: 'SSM Inventory tracks software and configuration data on managed instances. While it can store custom metadata, it is not designed for migration project tracking and lacks the migration status workflow, application grouping, and integration with migration tools that Migration Hub provides.' },
    ],
    explanation: { overall: 'AWS Migration Hub is the central tracking service for migrations: (1) Discover — import data from ADS, or manually; group servers into "applications". (2) Track — migration tools (MGN, DMS, CloudEndure) automatically report server migration status to Migration Hub when connected. (3) Status per server/application: Not Started → In Progress → Completed. (4) Home region — you configure one AWS region as the Migration Hub home; all tracking data aggregates there. (5) Reports — view overall migration progress, filter by application group (business unit). Migration Hub does NOT perform migrations; it tracks migrations performed by other tools.', examTip: 'Migration Hub integrations: MGN (Application Migration Service), DMS (Database Migration Service), CloudEndure Migration, Server Migration Service (deprecated). Migration Hub Refactor Spaces = separate service for incremental app modernization using strangler fig with managed routing. Migration Hub Orchestrator = workflow orchestration for complex migration sequences (coordinate DMS + MGN + validation steps). Know these distinctions for the exam.' },
    tags: ['migration-hub', 'migration-tracking', 'reporting', 'application-grouping', 'executive-dashboard'],
  },
];
