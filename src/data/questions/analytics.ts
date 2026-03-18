import type { Question } from './index';

export const analyticsQuestions: Question[] = [
  {
    id: 'ana-001',
    stem: 'A data engineering team needs to build a data lake on Amazon S3. They have structured data from RDS, semi-structured JSON from application logs, and unstructured data from IoT sensors. They want to run ad-hoc SQL queries without managing infrastructure. Which combination of services provides the most cost-effective solution?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Store all data in S3, use AWS Glue Data Catalog for schema discovery, and query with Amazon Athena', correct: true, explanation: 'This is the canonical serverless data lake architecture. Glue crawlers automatically discover schemas and populate the Data Catalog. Athena queries S3 data using Presto-based SQL without managing any servers. Pay per query (per TB scanned).' },
      { id: 'b', text: 'Load all data into Amazon Redshift and query using standard SQL', correct: false, explanation: 'Redshift requires cluster provisioning and is optimized for structured OLAP workloads. For mixed structured/semi-structured/unstructured data with ad-hoc queries, the S3 + Glue + Athena architecture is more cost-effective and flexible.' },
      { id: 'c', text: 'Use Amazon EMR with Spark SQL to process and query data in S3', correct: false, explanation: 'EMR with Spark requires cluster management and is best for large-scale data processing jobs. For ad-hoc SQL queries without managing infrastructure, Athena is simpler and more cost-effective.' },
      { id: 'd', text: 'Use Amazon OpenSearch Service to index and query all data types', correct: false, explanation: 'OpenSearch is optimized for full-text search and log analytics, not structured SQL queries on a data lake. It requires data to be ingested and indexed, adding cost and complexity.' }
    ],
    explanation: {
      overall: 'The AWS serverless data lake pattern: S3 (storage) + Glue Data Catalog (metadata) + Athena (query engine). Glue crawlers scan S3 data, infer schemas, and register tables in the Data Catalog. Athena uses the Data Catalog to execute SQL queries directly against S3 data without loading. Performance optimization: convert to Parquet/ORC format, partition data by date/region, compress with Snappy/Gzip. Cost: Athena charges $5/TB scanned — columnar formats and partitioning can reduce scanned data by 90%+.',
      examTip: 'Athena performance/cost optimization: (1) Use columnar formats (Parquet, ORC) — only reads queried columns. (2) Partition data (s3://bucket/year=2024/month=01/) — query WHERE year=2024 scans only that prefix. (3) Use Athena workgroups to control query costs and isolate teams. (4) Results cached — repeated identical queries use cached results for free. Athena vs Redshift: Athena = ad-hoc, serverless, pay-per-query. Redshift = complex OLAP, sustained analytics, provisioned or serverless.'
    },
    tags: ['athena', 'glue', 'data-lake', 's3', 'serverless-analytics']
  },
  {
    id: 'ana-002',
    stem: 'A company processes 1 million IoT sensor events per second. They need real-time anomaly detection (sub-second latency), hourly aggregations stored in S3 for historical analysis, and immediate alerting for threshold violations. Which architecture handles all three requirements?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Kinesis Data Streams → Lambda for real-time anomaly detection + Kinesis Data Firehose → S3 for hourly aggregations + SNS for alerts', correct: true, explanation: 'KDS handles 1M events/second with multiple consumers. Lambda processes each batch for sub-second anomaly detection and sends SNS alerts. Firehose can receive from KDS and buffer/aggregate data before writing to S3 with Parquet conversion.' },
      { id: 'b', text: 'Kinesis Data Firehose → S3 for all data, then trigger Lambda from S3 events for anomaly detection', correct: false, explanation: 'Firehose has a minimum 60-second buffer — this introduces at least 1-minute latency before Lambda can process, far exceeding the sub-second anomaly detection requirement.' },
      { id: 'c', text: 'SQS → Lambda for real-time processing, DynamoDB for aggregations, S3 for archival', correct: false, explanation: 'SQS has a maximum throughput of 3,000 messages/second per queue for standard queues. 1 million events/second exceeds SQS capacity significantly. Kinesis is designed for this scale.' },
      { id: 'd', text: 'Amazon MSK (Kafka) → Flink for streaming analytics → OpenSearch for dashboards', correct: false, explanation: 'While technically capable, this architecture introduces significant operational complexity (MSK cluster management, Flink job management, OpenSearch cluster). The AWS-native Kinesis-based solution is operationally simpler and fully managed.' }
    ],
    explanation: {
      overall: 'For real-time IoT at massive scale: Kinesis Data Streams ingests and buffers events with multiple independent consumers. Consumer 1: Lambda for sub-second anomaly detection → SNS alerts. Consumer 2: Kinesis Firehose for buffered S3 delivery (hourly aggregations with Glue for Parquet conversion). KDS Enhanced Fan-Out provides dedicated 2 MB/s throughput per consumer shard. With 1M events/second at 1KB each = 1 GB/s = 500 shards needed.',
      examTip: 'Kinesis capacity math: 1 shard = 1 MB/s write, 2 MB/s read. For 1M events/s at 1KB each = 1 GB/s write → 1,000 shards minimum. Enhanced Fan-Out: each consumer gets dedicated 2 MB/s read throughput per shard (not shared). KDS vs Firehose: KDS = real-time, multiple consumers, custom processing, data retained 24h-7 days. Firehose = delivery-only to S3/Redshift/OpenSearch, minimum 60s buffer, no replay, managed service. Often use both: KDS ingests, Firehose delivers to S3.'
    },
    tags: ['kinesis-data-streams', 'kinesis-firehose', 'real-time-analytics', 'iot', 'lambda']
  },
  {
    id: 'ana-003',
    stem: 'A company uses Amazon Redshift for their data warehouse. Queries that join large fact tables with dimension tables are slow. The solution architect identifies that dimension tables (customers, products) are small (< 2 MB each) but fact tables have billions of rows. What Redshift optimization technique would most improve query performance?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Distribute dimension tables using DISTSTYLE ALL to replicate them to every node', correct: true, explanation: 'DISTSTYLE ALL copies the entire table to every compute node. For small dimension tables (< 2 MB), this eliminates network shuffle when joining with fact tables distributed across nodes. Joins become node-local operations, dramatically improving performance.' },
      { id: 'b', text: 'Use Redshift Spectrum to query dimension tables directly from S3', correct: false, explanation: 'Redshift Spectrum queries data in S3 through external tables — it does not improve join performance for tables already in Redshift. Spectrum is for querying data that is not loaded into Redshift.' },
      { id: 'c', text: 'Enable Redshift automatic workload management (WLM) with query queues', correct: false, explanation: 'WLM manages query concurrency and memory allocation. It improves resource management but does not address the data distribution issue causing slow joins between large and small tables.' },
      { id: 'd', text: 'Increase the Redshift cluster node count to add more compute resources', correct: false, explanation: 'Adding nodes increases storage and parallelism but does not fix the network shuffle bottleneck caused by joining tables on different distribution keys. Distribution style optimization addresses the root cause.' }
    ],
    explanation: {
      overall: 'Redshift distribution styles control how data is partitioned across nodes. DISTSTYLE ALL copies the entire table to every node — optimal for small tables frequently joined with large tables. When a large fact table (DISTSTYLE KEY on join column) is joined with a small ALL-distributed dimension table, the join is resolved locally on each node without network data movement. For fact tables: use DISTSTYLE KEY on the most common join column for collocated joins between fact tables.',
      examTip: 'Redshift distribution styles: EVEN (default) = round-robin, no join optimization. KEY = rows with same key value on same node (good for large fact table joins). ALL = full copy on every node (small dimension tables only — <10 GB). AUTO = Redshift automatically chooses based on table size. Sort keys (SORTKEY): COMPOUND = sequential scans and range filters. INTERLEAVED = multiple filter columns equally weighted. Zone maps + sort keys skip blocks during scans.'
    },
    tags: ['redshift', 'diststyle', 'distribution-key', 'query-optimization', 'data-warehouse']
  },
  {
    id: 'ana-004',
    stem: 'A company needs to orchestrate a complex data pipeline: extract data from RDS nightly, transform it using PySpark, train an ML model with SageMaker, and load results to Redshift. They want managed workflow orchestration with retry logic, dependencies, and monitoring. Which service is best suited?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Glue Workflows with triggers to orchestrate the ETL pipeline steps', correct: false, explanation: 'Glue Workflows orchestrate Glue-specific jobs (Glue ETL and crawlers). They do not natively integrate with SageMaker training jobs or Redshift COPY commands as workflow steps.' },
      { id: 'b', text: 'Amazon MWAA (Managed Workflows for Apache Airflow) with DAGs defining the pipeline steps', correct: true, explanation: 'MWAA provides managed Apache Airflow with operators for RDS, Glue/EMR Spark, SageMaker, and Redshift. DAGs define dependencies, retry logic, and scheduling. CloudWatch integration for monitoring.' },
      { id: 'c', text: 'AWS Step Functions to orchestrate Lambda functions for each pipeline step', correct: false, explanation: 'Step Functions with Lambda can orchestrate simple pipelines but Lambda has a 15-minute timeout that may not accommodate long Spark jobs. Step Functions does support Glue and SageMaker integrations but MWAA is more natural for data engineering teams familiar with Airflow.' },
      { id: 'd', text: 'AWS CodePipeline with CodeBuild stages for each data transformation step', correct: false, explanation: 'CodePipeline is a CI/CD tool designed for software deployment pipelines. It is not designed for data pipeline orchestration and lacks native integrations with Glue, SageMaker, or Redshift.' }
    ],
    explanation: {
      overall: 'Amazon MWAA (Managed Workflows for Apache Airflow) is a managed Airflow service for workflow orchestration. It supports: Airflow DAGs with Python, native operators for AWS services (RDS, S3, Glue, EMR, SageMaker, Redshift), retry and timeout configurations, cross-DAG dependencies, and CloudWatch monitoring. Data engineering teams already using Airflow can migrate their DAGs to MWAA with minimal changes. Alternative: AWS Glue Workflows for Glue-only pipelines, Step Functions for simpler orchestration.',
      examTip: 'Workflow orchestration services: MWAA = Apache Airflow, complex multi-service pipelines, data engineering teams. Step Functions = AWS-native, visual state machines, simpler serverless workflows. Glue Workflows = Glue-only orchestration. EventBridge + Lambda = event-driven, lightweight. For data pipelines requiring SageMaker + Glue + Redshift in sequence, MWAA is most comprehensive. MWAA uses S3 for DAG storage and creates its own VPC resources.'
    },
    tags: ['mwaa', 'airflow', 'data-pipeline', 'orchestration', 'etl']
  },
  {
    id: 'ana-005',
    stem: 'A company\'s data team uses Amazon EMR for Spark jobs. They have a mix of long-running cluster jobs (8 hours) and short ad-hoc queries (5-10 minutes). To reduce costs, they want to use Spot Instances for fault-tolerant Spark jobs while ensuring critical jobs complete reliably. What EMR configuration achieves the best cost-performance balance?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Use EMR instance fleets with On-Demand primary and core nodes, and Spot task nodes; enable EMR managed scaling', correct: true, explanation: 'Primary and core nodes handle HDFS data and cluster management — use On-Demand for reliability. Task nodes are stateless (no HDFS data) — use Spot for cost savings. If task node Spot is interrupted, Spark simply uses remaining capacity. Managed scaling adjusts task node count based on YARN metrics.' },
      { id: 'b', text: 'Use all Spot Instances with checkpointing to S3 every 30 minutes', correct: false, explanation: 'If primary or core nodes are interrupted, HDFS data can be lost and the cluster may become unusable. All-Spot is risky for long-running jobs. Checkpointing does not protect against HDFS corruption from core node interruptions.' },
      { id: 'c', text: 'Use EMR Serverless for all jobs to eliminate instance management', correct: false, explanation: 'EMR Serverless (for Spark/Hive) automatically scales workers for each job submission. However, it does not support custom instance types or the full range of EMR configurations. For complex workloads, instance fleets provide more control.' },
      { id: 'd', text: 'Use a single EMR cluster with uniform instance groups and On-Demand instances', correct: false, explanation: 'Single On-Demand cluster is the safest but most expensive option. The mixed On-Demand/Spot approach with instance fleets achieves the cost-performance balance the question requires.' }
    ],
    explanation: {
      overall: 'EMR best practices for cost optimization: (1) On-Demand primary node (cluster manager, never interrupt), (2) On-Demand core nodes (HDFS DataNodes, interruption causes data loss), (3) Spot task nodes (stateless Spark executors, interruption only affects in-progress task attempts — Spark retries automatically). EMR instance fleets allow specifying multiple instance types and target capacities, increasing Spot availability across instance pools. Managed scaling: EMR automatically adds/removes task nodes based on YARN pending containers metric.',
      examTip: 'EMR node roles: Primary (master) = cluster management, resource manager — 1 node, never Spot. Core = HDFS DataNode + task execution — Spot risk exists but manageable with replication. Task = only task execution, no HDFS — perfect for Spot. Spot interruption handling: task nodes have 2-minute warning, YARN migrates tasks. EMR Serverless = no cluster management, scale-to-zero, pay-per-job — best for intermittent workloads. Instance fleet allows multiple instance types per group (bid across multiple pools for better Spot availability).'
    },
    tags: ['emr', 'spot-instances', 'instance-fleets', 'spark', 'cost-optimization']
  },
  {
    id: 'ana-006',
    stem: 'A company needs to provide business intelligence dashboards to 500 users with read-only access to their Redshift data warehouse. They want to avoid giving users direct Redshift credentials and need row-level security (different users see different subsets of data based on their department). Which approach is recommended?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use Amazon QuickSight with row-level security defined in QuickSight dataset rules, connecting to Redshift via SPICE or direct query', correct: true, explanation: 'QuickSight provides managed BI with row-level security at the dataset level. Users authenticate via QuickSight (IAM, AD, or SAML) without Redshift credentials. Row-level security filters data based on user identity attributes.' },
      { id: 'b', text: 'Create individual IAM users with Redshift GetClusterCredentials for each of the 500 users', correct: false, explanation: 'Creating 500 IAM users is operationally burdensome and each user would still need to know how to connect to Redshift. This does not provide a BI dashboard experience and managing 500 individual permissions is impractical.' },
      { id: 'c', text: 'Use Redshift row-level security policies directly and share credentials with BI users', correct: false, explanation: 'Redshift supports native row-level security (RLS) but sharing credentials with 500 users is a security risk. QuickSight provides the managed BI layer with SSO and abstracts the database credentials from end users.' },
      { id: 'd', text: 'Deploy Amazon OpenSearch dashboards connected to Redshift for self-service analytics', correct: false, explanation: 'OpenSearch Dashboards (Kibana) is for log analytics and search, not SQL-based BI dashboards from Redshift. OpenSearch and Redshift serve different use cases.' }
    ],
    explanation: {
      overall: 'Amazon QuickSight is AWS\'s managed BI service. For Redshift + 500 users: (1) QuickSight connects to Redshift using a single service account, (2) Users authenticate via QuickSight (IAM, Active Directory, SAML/SSO), (3) Row-level security in QuickSight dataset rules filters rows based on user identity (e.g., department = user\'s department), (4) No Redshift credentials exposed to users. SPICE (in-memory engine) caches data for faster queries and reduces Redshift load.',
      examTip: 'QuickSight row-level security: define a dataset rules file (CSV or dataset) mapping usernames/groups to filter values → upload to QuickSight → apply to dataset → users only see their rows. QuickSight user types: Enterprise = SAML/Active Directory integration, row-level security, Ml insights. Standard = basic features. QuickSight pricing: per-session (readers) or per-user (authors). SPICE cache: refresh data periodically to reduce database load, but adds cost per GB stored.'
    },
    tags: ['quicksight', 'redshift', 'row-level-security', 'bi-dashboards', 'spice']
  },
  {
    id: 'ana-007',
    stem: 'A company collects clickstream data in Kinesis Data Streams. They need to enrich each event with user profile data from DynamoDB (user tier, preferences), filter bot traffic using IP reputation lists, and write enriched data to S3 in Parquet format in real time. Which service processes the stream with these transformations?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon Kinesis Data Firehose with Lambda transformation and S3 destination in Parquet format', correct: true, explanation: 'Firehose natively converts to Parquet/ORC using the Glue Data Catalog schema. Lambda transformation function can enrich events with DynamoDB lookups and filter bot traffic before Firehose delivers to S3.' },
      { id: 'b', text: 'AWS Glue Streaming ETL jobs consuming from Kinesis and writing to S3', correct: false, explanation: 'Glue Streaming ETL supports Kinesis as a source and can write Parquet to S3, but requires managing a Glue job with allocated DPUs. Firehose with Lambda is operationally simpler for event-by-event transformation.' },
      { id: 'c', text: 'Amazon Kinesis Data Analytics (Flink) to process the stream and write to S3', correct: false, explanation: 'Kinesis Data Analytics with Apache Flink is powerful for complex stream processing but does not have native Parquet output to S3. Output typically goes to Kinesis Firehose which then delivers to S3 — making Firehose the better direct option.' },
      { id: 'd', text: 'AWS Lambda consuming directly from Kinesis and writing Parquet to S3 using PyArrow', correct: false, explanation: 'Lambda can consume from Kinesis and write Parquet using PyArrow libraries, but managing the S3 write batching, retries, and Parquet conversion is significantly more complex than Firehose\'s built-in Parquet support.' }
    ],
    explanation: {
      overall: 'Kinesis Firehose with Lambda transformation: Firehose reads from KDS → invokes Lambda for each batch (Lambda enriches from DynamoDB, filters bots) → Lambda returns transformed/filtered records → Firehose buffers and writes to S3. Native Parquet conversion uses Glue schema registry (no custom code needed for format conversion). Lambda transformation supports record enrichment, filtering (return empty result for dropped records), and data manipulation.',
      examTip: 'Firehose Lambda transformation: Lambda receives batches of records, returns records with processing status: Ok (transformed data), Dropped (filtered out), ProcessingFailed (send to error bucket). Lambda can enrich records by calling DynamoDB/APIs. Firehose Parquet/ORC conversion requires Glue Data Catalog table with schema — Firehose uses this schema to convert JSON → Parquet automatically. Firehose buffer: 60-900 seconds OR 1-128 MB (whichever reached first triggers delivery).'
    },
    tags: ['kinesis-firehose', 'lambda-transformation', 'parquet', 'stream-processing', 'enrichment']
  },
  {
    id: 'ana-008',
    stem: 'A healthcare company has 10 years of patient records in S3 (100 TB, Parquet format) and needs to run complex analytical queries joining multiple tables. Queries scan 50-200 GB per execution and run 50-100 times per day by 20 data scientists. They want to optimize costs and performance. Which approach is most cost-effective?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'cost-optimization',
    options: [
      { id: 'a', text: 'Use Athena with result caching, partitioned S3 data, and Athena workgroups with per-query data scanned limits', correct: true, explanation: 'Athena caches query results for 24 hours — repeated identical queries are free. Partitioning reduces data scanned per query. Workgroups enforce per-query data scan limits preventing runaway costs. At $5/TB, 100 GB per query × 75 queries = 7.5 TB/day × $5 = $37.50/day.' },
      { id: 'b', text: 'Load all data into Redshift Serverless and run queries from there', correct: false, explanation: 'Redshift Serverless charges based on RPUs consumed. For 50-100 queries/day with complex joins on 50-200 GB scans, Redshift may be more expensive than Athena for this query pattern. Athena is pay-per-query; Redshift charges for cluster uptime even when idle (for provisioned).' },
      { id: 'c', text: 'Use EMR with Spark SQL, keeping the cluster running 24/7 for low-latency queries', correct: false, explanation: 'A 24/7 EMR cluster for 50-100 queries/day is cost-inefficient. The cluster is idle between queries. EMR is better suited for continuous data processing pipelines, not ad-hoc analytical queries.' },
      { id: 'd', text: 'Use Redshift with S3 data loaded into Redshift tables and automatic table optimization', correct: false, explanation: 'Loading 100 TB into Redshift requires significant storage costs ($0.25/GB compressed). For data that lives primarily in S3, Athena (query in place) is more cost-effective than loading into Redshift.' }
    ],
    explanation: {
      overall: 'Athena cost optimization for large-scale analytics: (1) Parquet format = columnar, only reads queried columns (90%+ reduction vs CSV). (2) Partitioning = query filters on partition keys (date, region) skip entire S3 prefixes. (3) Result caching = identical queries within 24h are free. (4) Workgroup data scan limits = prevent accidental full-table scans. (5) S3 Intelligent-Tiering for data at rest. For 10 years of health data, partition by year/month/patient_id for optimal query performance.',
      examTip: 'Athena cost drivers: $5 per TB scanned (only for successful queries). Ways to reduce scanned data: columnar format (Parquet/ORC), compression (Snappy), partitioning, bucketing. Athena result reuse: queries run within 24h with same query string and configuration use cached results at no charge. Workgroup settings: per-query scan limit (e.g., 1 GB max per query), per-workgroup scan limit per time period. Athena ACID transactions via Apache Iceberg integration for update/delete support.'
    },
    tags: ['athena', 'cost-optimization', 'partitioning', 'result-caching', 'workgroups']
  },
  {
    id: 'ana-009',
    stem: 'A company wants to implement a real-time fraud detection system that processes financial transactions from Kinesis Data Streams, detects anomalies using ML (response within 100ms), and stores flagged transactions in DynamoDB for review. The model was trained in SageMaker. What architecture meets the latency requirement?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Kinesis Data Streams → Lambda (invoke SageMaker real-time endpoint for each transaction) → DynamoDB for flagged transactions', correct: true, explanation: 'Lambda processes Kinesis events in batches. For each transaction, Lambda invokes the SageMaker real-time inference endpoint (InvokeEndpoint API, typical latency 10-50ms for a deployed model). Lambda then writes flagged transactions to DynamoDB. Total latency: Kinesis read + SageMaker inference + DynamoDB write = well under 100ms.' },
      { id: 'b', text: 'Kinesis Data Firehose → S3 → SageMaker Batch Transform → DynamoDB', correct: false, explanation: 'Firehose has a minimum 60-second buffer before writing to S3, and Batch Transform processes data in bulk (minutes to hours). This architecture cannot achieve 100ms latency for real-time fraud detection.' },
      { id: 'c', text: 'Kinesis Data Analytics (Flink) → SageMaker batch inference → DynamoDB', correct: false, explanation: 'Flink streaming analytics can process events in real time, but SageMaker batch inference is for offline processing (not suitable for 100ms latency). The SageMaker real-time endpoint is needed for online inference.' },
      { id: 'd', text: 'Kinesis Data Streams → Kinesis Consumer Application on EC2 → SageMaker endpoint → DynamoDB', correct: false, explanation: 'While technically possible, managing EC2-based Kinesis consumers is more operationally complex than Lambda. Lambda provides automatic scaling, built-in Kinesis integration, and reduced operational overhead for this use case.' }
    ],
    explanation: {
      overall: 'Real-time ML inference pattern: Kinesis Data Streams (event buffer) → Lambda (trigger per batch) → SageMaker real-time endpoint (synchronous inference, ~10-50ms) → DynamoDB (write flagged transactions). SageMaker real-time endpoints are HTTP REST APIs that return predictions synchronously. Lambda\'s Kinesis trigger processes records as they arrive with sub-second latency. Total pipeline latency is well within 100ms when using properly provisioned SageMaker endpoints.',
      examTip: 'SageMaker inference types: Real-time endpoint = synchronous, low latency, always-on (billed per hour). Serverless inference = on-demand, cold start ~100ms, pay-per-request (good for intermittent traffic). Asynchronous inference = queue-based, for large payloads or long processing. Batch Transform = offline, bulk predictions from S3. For fraud detection (100ms requirement): use Real-time endpoint or Serverless inference (if cold start is acceptable after warm-up). Enable Provisioned Concurrency on SageMaker endpoint for consistent latency.'
    },
    tags: ['kinesis', 'lambda', 'sagemaker', 'real-time-inference', 'fraud-detection']
  },
  {
    id: 'ana-010',
    stem: 'A company ingests 500 GB of JSON data daily into S3. Data scientists use Athena to analyze the data, but queries are slow because Athena scans the full JSON files. The team wants to reduce query time and cost by 80% without changing their Athena query patterns. What should they implement?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Use AWS Glue ETL jobs to convert incoming JSON to Parquet format with partitioning, stored in a new S3 prefix', correct: true, explanation: 'Converting JSON to Parquet (columnar) + partitioning by date reduces Athena data scanned by 80-90%. Parquet stores data column-by-column — SELECT with few columns reads only those columns. Partitioning allows Athena to skip entire date ranges not in the query filter.' },
      { id: 'b', text: 'Enable S3 Intelligent-Tiering on the JSON data to reduce storage costs', correct: false, explanation: 'S3 Intelligent-Tiering reduces storage costs for infrequently accessed data but does not improve Athena query performance. Athena performance is about data format and scan efficiency, not storage tier.' },
      { id: 'c', text: 'Increase Athena DPU allocation to process queries faster', correct: false, explanation: 'Athena is serverless — there is no DPU configuration for standard Athena. (Athena Spark notebooks have DPU settings.) Standard Athena automatically scales based on query complexity. Performance is primarily data format and organization.' },
      { id: 'd', text: 'Use Amazon Redshift Spectrum to query the JSON data from S3', correct: false, explanation: 'Redshift Spectrum can query S3 data but requires a Redshift cluster and still suffers from JSON scan inefficiency. Converting to Parquet benefits both Athena and Spectrum equally — Athena without Redshift is simpler.' }
    ],
    explanation: {
      overall: 'JSON → Parquet conversion is the single biggest Athena optimization. Parquet columnar storage benefits: (1) Column pruning — SELECT name, age from 100-column JSON reads 100 columns; Parquet reads only 2 columns. (2) Predicate pushdown — Parquet stores min/max stats per row group, Athena skips row groups that cannot match WHERE filters. (3) Better compression — similar values compress together. Combined with date partitioning, expect 85-95% reduction in data scanned.',
      examTip: 'Athena optimization priority: (1) Partitioning > (2) Columnar format > (3) Compression > (4) File size (avoid too many small files — use S3 Batch Operations or Glue to compact). Parquet vs ORC: both columnar, both work well with Athena. Parquet is more widely supported by external tools. Snappy compression for Parquet is fast and good compression ratio. AWS Glue ETL job for JSON→Parquet conversion: use Glue DynamicFrame, apply schema, write in Parquet with partitioning.'
    },
    tags: ['athena', 'parquet', 'glue', 'query-optimization', 'columnar-format']
  },
  {
    id: 'ana-011',
    stem: 'A company uses Amazon OpenSearch Service for log analytics. They index application logs from multiple services and need full-text search, metric aggregations, and Kibana/OpenSearch Dashboards for visualization. The cluster is experiencing slow queries during peak hours. What should be investigated first?',
    type: 'multiple',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'JVM heap pressure — high heap usage (>85%) causes garbage collection pauses that slow queries', correct: true, explanation: 'JVM heap pressure is a primary cause of OpenSearch performance issues. When heap exceeds 85%, circuit breakers trip or garbage collection pauses cause query timeouts. Solution: scale up instance size or reduce heap pressure by adding nodes.' },
      { id: 'b', text: 'Shard count and size — too many small shards or too few large shards cause resource inefficiency', correct: true, explanation: 'Each shard is a Lucene index with overhead. Too many shards (undersized) consume excessive JVM heap for shard metadata. Too few large shards (>50 GB) cause slow queries. Optimal: 10-50 GB per shard, 1-3 shards per data node initially.' },
      { id: 'c', text: 'S3 snapshot frequency — excessive snapshotting consuming I/O resources during peak hours', correct: false, explanation: 'Automated S3 snapshots have some I/O overhead but are not a primary cause of query slowness. Snapshots are background operations. If queries are slow, investigate JVM, shard sizing, and instance resources first.' },
      { id: 'd', text: 'Index mapping conflicts — dynamic mapping creating too many fields (mapping explosion)', correct: true, explanation: 'Dynamic mapping on JSON logs can create thousands of fields. Each field has metadata overhead and consumes JVM heap. Mapping explosion significantly impacts performance. Disable dynamic mapping and define explicit mappings for required fields.' }
    ],
    explanation: {
      overall: 'OpenSearch performance troubleshooting: (1) JVM heap >85% → scale up data nodes or add nodes to distribute shards. (2) Shard sizing: target 10-50 GB/shard, avoid >1,000 shards/node. (3) Mapping explosion from dynamic field creation → define explicit mappings, use keyword type for exact values, text for full-text search. (4) Hot nodes vs warm nodes: use UltraWarm (S3-backed, cheaper) for older indices, retain hot nodes only for recent/frequently queried data.',
      examTip: 'OpenSearch (formerly Elasticsearch) on AWS: Data nodes (hot) = in-memory query processing. UltraWarm nodes = S3-backed, cheaper for older data (read-heavy). Cold storage = cheapest, S3 directly. Index lifecycle: hot (recent) → warm (UltraWarm) → cold (S3) → delete. Key metrics: JVMMemoryPressure (alert at 85%), CPUUtilization, SearchLatency, FreeStorageSpace. For log analytics at scale: use ISM (Index State Management) policies to automatically move, compress, and delete old indices.'
    },
    tags: ['opensearch', 'elasticsearch', 'jvm-heap', 'shard-optimization', 'performance']
  },
  {
    id: 'ana-012',
    stem: 'A company wants to build a data mesh architecture where multiple business domains (marketing, sales, finance) can independently manage their own data products in a central data lake while sharing data securely between domains. Which AWS services enable this decentralized data architecture?',
    type: 'single',
    difficulty: 3,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'AWS Lake Formation with cross-account data sharing, fine-grained access control, and separate data lake accounts per domain', correct: true, explanation: 'Lake Formation provides centralized data lake governance with fine-grained table/column/row-level permissions. Cross-account sharing via RAM allows domains in separate accounts to access each other\'s data products. Each domain owns their S3 prefix and Glue catalog, governed by Lake Formation.' },
      { id: 'b', text: 'Amazon Redshift data sharing across clusters in different VPCs', correct: false, explanation: 'Redshift data sharing allows read-only access to Redshift data across clusters, but this requires data to be in Redshift. A data mesh typically includes all data types in a data lake, not just structured data in a warehouse.' },
      { id: 'c', text: 'Amazon S3 cross-account bucket policies and IAM roles per domain', correct: false, explanation: 'Raw IAM/bucket policies lack the fine-grained column-level and row-level security that Lake Formation provides. Managing cross-account access at scale requires a governance layer like Lake Formation rather than raw IAM policies.' },
      { id: 'd', text: 'AWS Glue shared Data Catalog across all domain accounts', correct: false, explanation: 'The Glue Data Catalog is account-specific. While cross-account catalog sharing is possible, Lake Formation adds the governance, permission management, and data product publication capabilities needed for a proper data mesh.' }
    ],
    explanation: {
      overall: 'AWS Lake Formation enables a data mesh: (1) Central governance account manages Lake Formation permissions and data lake policies. (2) Domain accounts own their S3 data and Glue catalog tables. (3) Lake Formation cross-account grants allow other domains to query specific tables with column-level permissions. (4) Data producers publish data products by granting Lake Formation permissions. (5) Data consumers query using Athena with permissions enforced by Lake Formation, not S3 bucket policies.',
      examTip: 'Lake Formation permission model: database-level, table-level, column-level, row-level (row filter expressions). Cross-account: data lake admin grants access to external accounts → recipient\'s Lake Formation integrates as consumer → recipient queries via Athena/Glue with Lake Formation enforcing permissions. Lake Formation vs S3 bucket policies: Lake Formation controls DATA ACCESS (which tables/columns/rows). S3 bucket policies control STORAGE ACCESS. Both must grant access for full data lake security.'
    },
    tags: ['lake-formation', 'data-mesh', 'fine-grained-access', 'cross-account', 'data-governance']
  },
  {
    id: 'ana-013',
    stem: 'A company uses AWS Glue to run nightly ETL jobs that transform data from RDS to S3. The jobs take 4-5 hours and have been failing intermittently due to out-of-memory errors when processing large partitions. How can they resolve the memory issues and improve job reliability?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Increase Glue job DPU count to add more memory and parallelism, and use job bookmarks to avoid reprocessing completed data', correct: true, explanation: 'DPU (Data Processing Unit) increases both memory (16 GB RAM per DPU) and executor count. More DPUs distribute the partition processing across more executors, reducing memory per executor. Job bookmarks track processed data to avoid reprocessing on reruns.' },
      { id: 'b', text: 'Enable Glue DataBrew for memory-efficient data transformation', correct: false, explanation: 'Glue DataBrew is a visual data preparation tool for data cleaning, not a replacement for complex ETL jobs. It does not address the memory issues in existing Glue Spark jobs.' },
      { id: 'c', text: 'Switch to AWS Lambda for smaller, memory-efficient transformations', correct: false, explanation: 'Lambda has a 10 GB memory limit and 15-minute timeout — insufficient for 4-5 hour, multi-TB ETL jobs. Glue is the appropriate service for large-scale data transformation.' },
      { id: 'd', text: 'Migrate the Glue job to EMR with auto-scaling for dynamic resource allocation', correct: false, explanation: 'While EMR with auto-scaling can handle the workload, migrating from Glue to EMR adds operational complexity (cluster management). Increasing Glue DPUs is a simpler and more appropriate first step.' }
    ],
    explanation: {
      overall: 'AWS Glue Spark jobs run on a managed Spark environment. DPU count determines job resources: 1 DPU = 4 vCPUs + 16 GB RAM. For OOM errors: increase DPU count (more worker nodes), use G.2X or G.4X worker types (more RAM per worker), or repartition the input data to create smaller partitions. Job bookmarks maintain state of processed data — if a job fails after processing some data, rerunning only processes new/unprocessed data.',
      examTip: 'Glue worker types: Standard (G.1X) = 4 vCPUs, 16 GB RAM. G.2X = 8 vCPUs, 32 GB RAM (good for memory-intensive transforms). G.4X = 16 vCPUs, 64 GB RAM. G.8X = 32 vCPUs, 128 GB RAM. Glue Flex execution = 34% cheaper, uses spare Fargate capacity (for non-urgent jobs). Job bookmarks: track S3 files processed by timestamp — prevent duplicate processing on reruns. For dynamic frame partition handling: use repartition() or coalesce() in Spark to control partition sizes.'
    },
    tags: ['glue', 'etl', 'dpu', 'out-of-memory', 'job-bookmarks']
  },
  {
    id: 'ana-014',
    stem: 'A company wants to provide self-service analytics to business users who are not familiar with SQL. Users should be able to ask natural language questions about their sales data (e.g., "What were total sales by region last quarter?") and receive visualized answers. Which AWS service provides this capability?',
    type: 'single',
    difficulty: 1,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Amazon QuickSight Q — natural language query feature that generates visualizations from questions', correct: true, explanation: 'QuickSight Q uses ML to interpret natural language questions and automatically generates appropriate visualizations from connected datasets. Business users type questions in plain English and receive charts and tables without writing SQL.' },
      { id: 'b', text: 'Amazon Lex chatbot integrated with Athena to parse questions and execute SQL queries', correct: false, explanation: 'Building a natural language → SQL → Athena pipeline using Lex requires significant custom development. QuickSight Q provides this capability as a built-in, managed feature without custom integration work.' },
      { id: 'c', text: 'Amazon Kendra for enterprise search across sales data stored in S3', correct: false, explanation: 'Kendra is an intelligent enterprise search service for finding documents. It does not provide analytics visualizations or data aggregation capabilities for business intelligence queries.' },
      { id: 'd', text: 'Amazon SageMaker Canvas for point-and-click ML predictions on sales data', correct: false, explanation: 'SageMaker Canvas allows business users to build ML models without code — for predictions and forecasting. It is not designed for natural language BI queries and visualization generation.' }
    ],
    explanation: {
      overall: 'Amazon QuickSight Q is a natural language querying feature for QuickSight. Users type business questions in plain English, and Q generates relevant visualizations (bar charts, line charts, tables) by interpreting the question semantically. It uses ML to understand intent, map to data columns, generate SQL, and create appropriate chart types. Business owners can answer their own data questions without relying on BI developers or writing SQL.',
      examTip: 'QuickSight features: Standard dashboards (author creates, readers consume). Q = natural language queries for self-service. ML Insights = anomaly detection, forecasting, auto-narratives in dashboards. Paginated reports = print-quality reports for regulatory/operational reporting. QuickSight Embedded = embed dashboards in external applications. For the exam: QuickSight = AWS BI service. QuickSight Q = NLP for self-service analytics. These are both within QuickSight, not separate services.'
    },
    tags: ['quicksight', 'quicksight-q', 'natural-language', 'self-service-analytics', 'bi']
  },
  {
    id: 'ana-015',
    stem: 'A company\'s data lake has accumulated 5 years of transaction data in S3. Different teams use Athena and Spark (via EMR/Glue) to query the data. They need ACID transactions support (UPDATE and DELETE operations), schema evolution, and time travel (query historical versions of data). Which table format should they adopt?',
    type: 'single',
    difficulty: 2,
    topicSlug: 'analytics',
    examDomain: 'new-solutions',
    options: [
      { id: 'a', text: 'Apache Iceberg table format with Athena, Glue, and EMR integration', correct: true, explanation: 'Apache Iceberg provides ACID transactions, schema evolution (add/drop/rename columns without rewriting data), and time travel (query data as of a specific timestamp or snapshot ID). AWS natively supports Iceberg in Athena, Glue, and EMR.' },
      { id: 'b', text: 'AWS Glue Delta Lake format with ACID transaction support', correct: false, explanation: 'Delta Lake is an open-source format that provides similar capabilities (ACID, time travel, schema evolution). It is supported by AWS but requires Spark (EMR/Glue Spark) — Athena does not natively support Delta Lake queries as of 2024.' },
      { id: 'c', text: 'Parquet files with versioned S3 prefixes (date-based partitions) for historical access', correct: false, explanation: 'Parquet with date partitions provides historical data access but not true time travel (point-in-time queries), ACID transactions, or schema evolution without rewriting files. It is a workaround, not a proper solution.' },
      { id: 'd', text: 'Amazon S3 Versioning to maintain historical copies of all data files', correct: false, explanation: 'S3 versioning maintains object version history but cannot reconstruct a consistent table snapshot at a point in time (files are updated independently). Iceberg maintains table-level snapshots with consistent views.' }
    ],
    explanation: {
      overall: 'Apache Iceberg is the recommended open table format for data lake ACID compliance. AWS integrates Iceberg with: Athena (Iceberg DML: INSERT, UPDATE, DELETE, MERGE INTO), Glue (Iceberg table catalog), EMR (Iceberg Spark integration), and Lake Formation (fine-grained access on Iceberg tables). Iceberg features: (1) Atomic commits (ACID), (2) Snapshot isolation (concurrent reads/writes), (3) Schema evolution (no rewrites), (4) Partition evolution, (5) Time travel (SELECT ... FOR SYSTEM_TIME AS OF \'2024-01-01\')',
      examTip: 'Open table formats comparison: Iceberg = best AWS native support (Athena + Glue + EMR), time travel, schema evolution, row-level deletes. Delta Lake = Databricks origin, Spark-focused, Athena limited support. Hudi = Uber origin, streaming upserts focus, Athena and Glue support. For AWS-centric analytics stack with Athena: Iceberg is the recommended choice. Athena Iceberg: CREATE TABLE ... TBLPROPERTIES (\'table_type\'=\'ICEBERG\').'
    },
    tags: ['iceberg', 'acid-transactions', 'time-travel', 'schema-evolution', 'data-lake']
  }
];
