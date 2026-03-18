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
  }
];
