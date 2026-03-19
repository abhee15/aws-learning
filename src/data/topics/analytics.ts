import type { Topic } from '../../types/topic';

export const analyticsTopic: Topic = {
  id: 'analytics',
  slug: 'analytics',
  title: 'Analytics: Athena, Glue, EMR & Kinesis',
  shortTitle: 'Analytics',
  icon: 'BarChart3',
  color: 'emerald',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 5,
  summaryBullets: [
    'Athena: serverless SQL on S3. Partition projection + columnar formats (Parquet/ORC) reduce cost 10-100x',
    'AWS Glue: serverless ETL (Spark). Glue Crawler → Data Catalog → Glue Job. Glue DataBrew for visual transforms',
    'EMR: managed Hadoop/Spark cluster. EMR Serverless for elastic auto-scaling without cluster management',
    'Kinesis Data Streams: real-time sub-second streaming. Kinesis Firehose: managed delivery to S3/Redshift/OpenSearch',
    'Redshift: columnar data warehouse with Redshift Spectrum for S3 queries. RA3: separate compute/storage scaling',
  ],
  relatedTopics: ['s3', 'databases', 'messaging'],
  solutionArchitectures: [
    {
      id: 'analytics-arch-lake-house',
      title: 'Modern Data Lake House on AWS',
      description: 'Streaming and batch data ingested to S3 data lake. AWS Glue catalogs and transforms. Athena for ad-hoc queries. Redshift Spectrum for data warehouse queries across S3 and Redshift. QuickSight for BI dashboards.',
      useCase: 'Organizations needing unified analytics across real-time event streams and historical batch data. E-commerce clickstream analysis, IoT telemetry, financial reporting.',
      components: [
        { name: 'Kinesis Data Firehose', role: 'Ingests real-time streams (clickstream, IoT events) and delivers to S3 with automatic partitioning by date/hour. No servers to manage.' },
        { name: 'AWS Glue Crawler', role: 'Discovers S3 data structure automatically and populates the Glue Data Catalog with table schema, partition info, and data types.' },
        { name: 'AWS Glue Data Catalog', role: 'Central metadata repository. Shared by Athena, EMR, Redshift Spectrum, and Glue Jobs — single source of truth for all data assets.' },
        { name: 'Glue ETL Jobs', role: 'Transform raw JSON/CSV to columnar Parquet with partitioning. Run on schedule or triggered by S3 events. Serverless Spark execution.' },
        { name: 'Amazon Athena', role: 'Serverless SQL queries against S3. Uses Glue Data Catalog for schema. Pay per TB scanned — Parquet reduces scan cost dramatically.' },
        { name: 'Redshift + Spectrum', role: 'Data warehouse for structured reporting data. Redshift Spectrum extends queries to S3 without loading — join warehouse tables with S3 lake data.' },
        { name: 'Amazon QuickSight', role: 'BI dashboards connected to Athena and Redshift. SPICE in-memory engine for sub-second dashboard performance. Row-level security per user.' },
      ],
      dataFlow: [
        'Streaming: app events → Kinesis Firehose → S3 raw zone (JSON, partitioned by date)',
        'Batch: transactional DB → AWS Glue ETL → S3 processed zone (Parquet, partitioned by date/region)',
        'Cataloging: Glue Crawler runs hourly → updates Data Catalog with new partitions',
        'Ad-hoc: data analyst → Athena SQL → scans only relevant Parquet partitions → results in seconds',
        'Reporting: Redshift loads structured aggregates from S3 → QuickSight dashboard queries Redshift + Spectrum for historical S3 data',
        'Cost insight: Athena cost = (partitioned Parquet scan) ≈ $0.005 vs $5 for full JSON scan on same dataset',
      ],
      keyDecisions: [
        'Athena vs Redshift: Athena for ad-hoc, infrequent queries on S3. Redshift for frequent, complex SQL with many concurrent users needing sub-second response',
        'Glue vs EMR: Glue for serverless ETL (smaller jobs, no cluster management). EMR for complex Spark/Hadoop pipelines needing cluster-level control (custom Spark config, spot instance fleets)',
        'Parquet partitioning strategy: partition on the most common WHERE clause filters (date, region, event_type). Wrong partitions can increase cost — too granular = too many small files',
        'Data Catalog sharing: enable Lake Formation for fine-grained column/row-level permissions on catalog tables across Athena, Glue, and Redshift Spectrum',
      ],
      tradeoffs: [
        { pro: 'Fully serverless data lake reduces operational overhead — no clusters to manage for Athena or Firehose', con: 'Athena cost unpredictable without query governance — a single full-table scan on a large unpartitioned table can cost hundreds of dollars' },
        { pro: 'S3 as storage layer enables unlimited scale at very low cost ($0.023/GB/month)', con: 'Strong consistency model for analytics requires careful partition management and compaction of small files (use Glue or EMR compaction jobs)' },
      ],
      examAngle: 'Key exam pattern: Kinesis Firehose → S3 (raw) → Glue ETL → S3 (Parquet) → Athena (ad-hoc) + Redshift Spectrum (warehouse). Know when to use each query engine. Athena is cost-optimized for low-frequency queries; Redshift for high-concurrency business intelligence.',
    },
  ],
  subtopics: [
    {
      id: 'analytics-query',
      title: 'Athena & Interactive Querying',
      sections: [
        {
          id: 'analytics-athena',
          title: 'Amazon Athena — Serverless SQL on S3',
          content: '**Amazon Athena**: Interactive serverless SQL query service for data in S3. Based on Presto engine. No infrastructure to manage. Pay per query: $5 per TB of data scanned.\n\n**Key concepts**:\n- Define tables in AWS Glue Data Catalog (or Athena-managed catalog)\n- Tables point to S3 prefixes — schema-on-read\n- Supports: CSV, JSON, ORC, Parquet, Avro, TSV\n- Federated Queries: query data in RDS, DynamoDB, Redshift, CloudWatch Logs using Lambda-based data source connectors — join across data sources in one SQL query\n\n**Cost optimization — critical for SA Pro**:\n- **Columnar formats**: Convert to Parquet or ORC. Athena scans only needed columns. Typical: 85% cost reduction vs CSV.\n- **Partitioning**: S3 path structure `s3://bucket/table/year=2024/month=03/` → Athena prunes partitions. Only scans relevant partitions from WHERE clause.\n- **Partition Projection**: Define partition ranges in table properties — Athena computes valid partition values without reading S3 to discover them. Eliminates Glue Crawler dependency for partition discovery. Faster and cheaper for time-series data.\n- **Compression**: GZIP (good compression, not splittable), Snappy (splittable, fast), ZSTD (best compression ratio, splittable). Use Snappy or ZSTD for columnar formats.\n- **Compaction**: Merge many small files into fewer large files — many small S3 files = many separate requests = slower queries and higher cost.\n\n**Athena Workgroups**: Separate query environments with individual IAM permissions, per-query and per-workgroup data scanned limits, result location isolation. Enforce cost controls — prevent analysts from running unbounded queries.\n\n**Athena for Logs**: Native support for AWS service logs:\n- CloudTrail logs (SQL over management and data events)\n- ALB access logs\n- VPC Flow Logs\n- CloudFront access logs\nUse for: security investigations, cost attribution, traffic analysis — without loading logs into a database.',
          keyPoints: [
            { text: 'Athena cost optimization trifecta: columnar format (Parquet) + partitioning + compression = 90%+ reduction in data scanned vs raw CSV', examTip: true },
            { text: 'Partition Projection: declare partition ranges in table DDL — eliminates need for Glue Crawler to discover new partitions. Required for high-partition time-series tables', examTip: true },
            { text: 'Athena Federated Query: use Lambda connectors to query RDS, DynamoDB, Redshift in one SQL statement — joins across data stores without ETL', examTip: true },
            { text: 'Athena Workgroups: enforce per-query data scan limits and cost controls. Without workgroup limits, a single bad query can scan TBs and cost hundreds of dollars', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Convert all Athena source data to Parquet with Snappy compression and date-based partitioning — reduces data scanned by 85-95%, directly proportional to cost reduction' },
            { pillar: 'operational-excellence', text: 'Use Athena Workgroups with data scan limits per query — prevents runaway queries from generating unexpected costs. Set workgroup-level cost alerts via CloudWatch' },
            { pillar: 'performance', text: 'Use Partition Projection for time-series tables with daily/hourly partitions — eliminates partition metadata overhead and delivers 2-10x faster query planning' },
          ],
          useCases: [
            {
              scenario: 'A startup stores application logs in S3 as raw JSON, one file per minute. An analyst runs Athena queries over 3 months of logs and is billed $480 for a single query that scanned 8 TB of data.',
              wrongChoices: ['Move logs to Redshift to reduce Athena scan costs — adds infrastructure and ETL overhead', 'Reduce S3 log retention to 30 days to limit the data volume — loses historical analysis capability'],
              correctChoice: 'Convert logs to Parquet with Snappy compression, partition by year/month/day using Glue ETL job. Athena will scan only the relevant date partitions and only needed columns — typical result: 95% cost reduction',
              reasoning: 'Athena charges $5/TB scanned. Raw JSON forces full-column, full-file scans. Converting to Parquet: columnar format means Athena reads only queried columns. Adding date partitions means WHERE date=\'2024-03\' scans only March data. Combined: a query that cost $480 on 8TB JSON might cost $24 on 0.4TB Parquet.',
            },
            {
              scenario: 'A security team needs to investigate whether any IAM role in any of their 200 AWS accounts made API calls to a specific S3 bucket over the past 90 days. CloudTrail is enabled with data events on the bucket across all accounts.',
              wrongChoices: ['Download CloudTrail logs from all 200 accounts to a local machine and grep through them', 'Use CloudWatch Logs Insights — it queries CloudWatch Logs, not CloudTrail S3 files'],
              correctChoice: 'Use Amazon Athena to query the centralized CloudTrail S3 bucket. Create an Athena table over the CloudTrail log path, partition by account/region/date, then run: SELECT useridentity.arn, eventtime FROM cloudtrail_logs WHERE requestparameters LIKE \'%sensitive-bucket%\'',
              reasoning: 'CloudTrail delivers logs to S3. Athena can query S3 files directly using the cloudtrail_logs table. With partitioning by account and date, the query scans only relevant partitions across all 200 accounts. No need to move data or set up a separate log analysis platform.',
            },
          ],
        },
      ],
    },
    {
      id: 'analytics-etl',
      title: 'AWS Glue — Serverless ETL',
      sections: [
        {
          id: 'analytics-glue',
          title: 'AWS Glue Architecture & Components',
          content: '**AWS Glue**: Fully managed serverless ETL (Extract, Transform, Load) service based on Apache Spark. Core components:\n\n**Glue Data Catalog**: Central metadata store for all data assets. Tables, schemas, partition info. Shared with Athena, EMR, Redshift Spectrum, and Lake Formation. Replaces need for a separate Hive Metastore.\n\n**Glue Crawlers**: Automatically discover data in S3 (or JDBC sources) and populate the Data Catalog. Infers schema, detects partitions, handles schema evolution. Schedule or trigger on S3 events. Limitation: adds latency — consider Partition Projection for fast partition discovery.\n\n**Glue ETL Jobs**: Serverless Apache Spark jobs. Write in Python (PySpark) or Scala. Glue DynamicFrame extends Spark DataFrame for schema flexibility (handles inconsistent/nested JSON). Job types:\n- Spark (default): batch ETL, large transformations\n- Streaming: continuous Spark Structured Streaming from Kinesis or Kafka\n- Python Shell: lightweight scripts without full Spark overhead (for small datasets)\n- Ray: distributed Python for ML preprocessing\n\n**Glue Studio**: Visual drag-and-drop interface to build ETL pipelines without code. Generates PySpark code underneath. Useful for non-Spark developers.\n\n**Glue DataBrew**: Visual data preparation tool. 250+ built-in transforms. Profile data quality. No code. Output to S3 or JDBC. Use for: data analysts preparing datasets for ML without engineering support.\n\n**Glue Workflow**: Orchestrate multiple crawlers and jobs in a dependency graph. Trigger on schedule or events. Alternative to Step Functions for purely Glue-based pipelines.\n\n**Glue Data Quality**: Define data quality rules (row counts, column constraints, referential integrity). Run as part of ETL job. Publish metrics to CloudWatch. Halt pipeline if quality thresholds not met.\n\n**AWS Lake Formation**: Governance layer on top of Glue Data Catalog. Fine-grained permissions: column-level, row-level, cell-level security. Cross-account data sharing. Tag-based access control (TBAC). Centralized audit logs.',
          keyPoints: [
            { text: 'Glue Crawler → Data Catalog → Athena/EMR/Redshift Spectrum: catalog is shared — one schema definition, multiple query engines', examTip: true },
            { text: 'Glue DynamicFrame: handles schema inconsistencies in raw data (different JSON structures per record) that would fail a Spark DataFrame schema enforcement', examTip: true },
            { text: 'Lake Formation: adds column/row-level security to Data Catalog. Required when different teams should see different columns of the same table', examTip: true },
            { text: 'Glue Streaming Jobs: continuous Spark Structured Streaming — use for near-real-time ETL from Kinesis. Not a replacement for Kinesis Data Streams (which is lower latency)', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'operational-excellence', text: 'Enable Glue Data Quality checks in ETL pipelines — catch data issues at ingestion rather than discovering bad data after it reaches reporting dashboards' },
            { pillar: 'security', text: 'Use Lake Formation for data catalog permissions instead of S3 bucket policies — enables column-level security and cross-account sharing with a single control plane' },
            { pillar: 'cost-optimization', text: 'Use Glue Python Shell jobs for lightweight transformations (< 1M records) — 90% cheaper than launching a full Spark cluster for small jobs' },
          ],
        },
      ],
    },
    {
      id: 'analytics-compute',
      title: 'EMR — Big Data Processing',
      sections: [
        {
          id: 'analytics-emr',
          title: 'Amazon EMR — Managed Hadoop & Spark',
          content: '**Amazon EMR (Elastic MapReduce)**: Managed cluster platform for running Apache Spark, Hadoop, Hive, Presto, Flink, and other big data frameworks. You control cluster configuration; AWS manages provisioning, patching, and node replacement.\n\n**EMR Deployment options**:\n- **EMR on EC2**: Traditional cluster model. Master node + Core nodes (HDFS) + Task nodes (compute-only, no HDFS). Spot instances for task nodes = 60-80% cost savings.\n- **EMR on EKS**: Run Spark jobs as Kubernetes pods on EKS. Share EKS cluster with other workloads. Use Karpenter for node auto-provisioning.\n- **EMR Serverless**: Submit Spark or Hive jobs without managing clusters. Auto-scales workers per job. No cluster to start/stop. Pre-initialized capacity for fast job start. Ideal for variable workloads.\n\n**EMR Storage options**:\n- **HDFS on EBS/Instance Store**: Local fast storage. Data lost when cluster terminates. Use for iterative algorithms needing fast local reads.\n- **EMRFS (S3)**: Use S3 as persistent storage layer instead of HDFS. Separate compute and storage — terminate cluster when done, data persists. Consistent View handles S3 eventual consistency (legacy — now S3 is strongly consistent).\n\n**EMR Instance Fleet vs Instance Groups**:\n- Instance Groups: single instance type per group. Simpler but less flexibility.\n- Instance Fleets: specify multiple instance types + On-Demand/Spot mix. EMR picks from available types to fulfill capacity. Better Spot availability and cost optimization.\n\n**EMR Cluster Lifecycle**:\n- Transient (auto-terminate): spin up, run job, terminate. Cheapest — no idle compute. Results to S3.\n- Long-running: persist cluster for interactive Spark sessions (Jupyter via EMR Studio). More expensive but avoids startup latency per job.\n\n**EMR vs Glue**: Both run Spark. Glue: fully serverless, no cluster management, for ETL pipelines. EMR: more control over Spark configuration, supports more frameworks (Hadoop, Flink, Presto), for complex data engineering and data science.',
          keyPoints: [
            { text: 'EMR Serverless: no cluster management, auto-scales per job, pre-initialized capacity for faster starts. Best for variable or unpredictable Spark workloads', examTip: true },
            { text: 'EMR on EC2 with Spot task nodes: task nodes have no HDFS, so losing a Spot node only affects compute (not data). Core nodes should use On-Demand to protect HDFS', examTip: true },
            { text: 'EMRFS (S3 as HDFS): terminate cluster between jobs to save cost. Data persists in S3. Enables true elastic cluster model', examTip: true },
            { text: 'EMR vs Glue: Glue for serverless ETL pipelines. EMR for complex Spark tuning, multi-framework (Presto + Spark + Flink), or long-running interactive sessions', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Use transient EMR clusters with S3 (EMRFS) — terminate after each batch job. Spot Instance Fleets for task nodes save 60-80%. Only pay for active compute time.' },
            { pillar: 'performance', text: 'Use EMR Instance Fleets with multiple instance types for Spot — if target instance type is unavailable, EMR automatically substitutes equivalent types, reducing interruptions' },
            { pillar: 'operational-excellence', text: 'Use EMR Serverless for most new Spark workloads — eliminates cluster sizing, patching, and availability management while providing automatic scaling' },
          ],
          comparisons: [
            {
              headers: ['Feature', 'AWS Glue', 'EMR Serverless', 'EMR on EC2'],
              rows: [
                ['Cluster management', 'None', 'None', 'Full control'],
                ['Frameworks', 'Spark only', 'Spark, Hive', 'Spark, Hadoop, Flink, Presto, +'],
                ['Startup time', '~2 min', '~30s (pre-init)', '~5-10 min'],
                ['Spot support', 'No', 'Yes (managed)', 'Yes (manual config)'],
                ['Data Catalog', 'Native integration', 'Via Glue catalog', 'Via Glue catalog or Hive'],
                ['Best for', 'ETL pipelines, simple transforms', 'Spark jobs, variable workloads', 'Complex tuning, multi-framework'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'analytics-streaming',
      title: 'Kinesis & Real-Time Analytics',
      sections: [
        {
          id: 'analytics-kinesis',
          title: 'Kinesis Data Streams vs Firehose vs Data Analytics',
          content: '**Amazon Kinesis Data Streams (KDS)**: Real-time streaming data service. Producers publish records to shards. Consumers read from shards. Sub-second latency. Retention: 24 hours default, up to 365 days.\n\n**KDS Capacity**:\n- Each shard: 1 MB/s write, 2 MB/s read (shared). 1,000 records/s write.\n- Standard consumers: 2 MB/s per shard shared across all consumers.\n- Enhanced Fan-Out (EFO): 2 MB/s per shard per consumer — dedicated throughput per consumer (push model via HTTP/2). Use when multiple consumers compete for the same shard throughput.\n- On-Demand mode: no shard management — automatically scales to peak throughput. Pay per GB in/out. Simpler but more expensive than Provisioned for predictable workloads.\n\n**Amazon Kinesis Data Firehose**: Managed delivery service. Reads from KDS (or directly), buffers, optionally transforms (Lambda), and delivers to: S3, Redshift, OpenSearch, Splunk, Datadog, custom HTTP endpoint. Near-real-time (60-900 second buffer). Fully managed — no consumers to code.\n\n**Amazon Managed Service for Apache Flink (formerly Kinesis Data Analytics)**: Run Apache Flink applications against KDS or Kinesis Firehose. SQL or Java/Python/Scala Flink programs. Use for: real-time aggregations, anomaly detection, session windowing.\n\n**KDS vs SQS vs Kinesis Firehose**:\n- KDS: multiple consumers, ordered within shard, replayable (retention), real-time. Use for: event sourcing, real-time dashboards, stream processing with multiple readers.\n- SQS: single consumer per message (or competing consumers), no ordering (Standard), deletion after consume. Use for: work queues, task decoupling.\n- Firehose: managed delivery only, no custom consumers, near-real-time, automatic scaling. Use for: log ingestion to S3/Redshift.\n\n**Partition Key Design for KDS**: Records with same partition key go to same shard → same order guarantee. Hot partition problem: if one key gets all traffic, one shard is overwhelmed. Strategies:\n- Use high-cardinality keys (user_id, device_id) for even distribution\n- Add random suffix to hot keys for distribution (then aggregate downstream)',
          keyPoints: [
            { text: 'Enhanced Fan-Out: each consumer gets dedicated 2MB/s per shard. Without EFO, all consumers share 2MB/s per shard — required for high-throughput multi-consumer pipelines', examTip: true },
            { text: 'Kinesis Firehose: near-real-time (60s minimum buffer). Not real-time. If sub-second delivery is needed, use KDS with a Lambda consumer, not Firehose', gotcha: true },
            { text: 'KDS On-Demand: no capacity planning, scales automatically. More expensive than Provisioned for predictable high-volume streams', examTip: true },
            { text: 'Hot shard problem: if all records use the same partition key, all traffic hits one shard (1MB/s limit). Use high-cardinality keys for even distribution', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Use Kinesis Data Streams with 7-day retention for critical event streams — allows consumer replay on failure without data loss. Default 24h is insufficient for weekend incident recovery' },
            { pillar: 'performance', text: 'Enable Enhanced Fan-Out for Lambda consumers processing KDS in production — eliminates shared throughput contention when multiple downstream systems consume the same stream' },
            { pillar: 'cost-optimization', text: 'Use Kinesis Firehose (not KDS) for simple log delivery to S3 — Firehose is fully managed, auto-scales, and costs less than managing KDS shards for write-once delivery use cases' },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Kinesis Data Streams', 'Kinesis Firehose', 'SQS Standard'],
              rows: [
                ['Latency', 'Milliseconds', '60-900 seconds', 'Milliseconds'],
                ['Consumers', 'Multiple (persistent)', 'Managed delivery only', 'Competing consumers (1 per msg)'],
                ['Ordering', 'Per-shard ordering', 'No ordering', 'No ordering'],
                ['Replay', 'Yes (up to 365 days)', 'No', 'No (once consumed, gone)'],
                ['Scaling', 'Manual (shards) or On-Demand', 'Automatic', 'Automatic'],
                ['Use case', 'Real-time multi-consumer streaming', 'Log delivery to S3/Redshift', 'Work queue, task decoupling'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'analytics-warehouse',
      title: 'Amazon Redshift — Data Warehouse',
      sections: [
        {
          id: 'analytics-redshift',
          title: 'Redshift Architecture & Features',
          content: '**Amazon Redshift**: Fully managed columnar data warehouse. Petabyte-scale SQL analytics. Massively Parallel Processing (MPP) — query distributed across compute nodes simultaneously.\n\n**Architecture**:\n- Leader node: receives queries, builds query plan, coordinates compute nodes\n- Compute nodes: execute query slices in parallel. Node types: ra3 (managed storage), dc2 (SSD, fixed storage)\n- RA3 nodes: decouple compute and storage — scale compute independently, pay for Redshift Managed Storage (S3-backed) separately. Preferred for most workloads.\n\n**Redshift Serverless**: Run analytics without provisioning clusters. Automatically scales compute capacity in response to queries. Pay per second of compute used. No capacity planning. Ideal for variable or sporadic analytics workloads.\n\n**Redshift Spectrum**: Query data directly in S3 without loading into Redshift tables. Uses Glue Data Catalog for schema. Spectrum scales compute independently — thousands of nodes for large S3 scans. Join S3 external tables with Redshift local tables in one SQL query. Cost: $5 per TB scanned (same as Athena).\n\n**Distribution Styles** (critical for query performance):\n- **AUTO**: Redshift automatically selects distribution based on table size\n- **EVEN**: Rows distributed round-robin across slices. Best for tables with no common join key.\n- **KEY**: Rows with same key value go to same slice. Best for large tables frequently joined on a specific column (co-locate joined data).\n- **ALL**: Full copy of table on every node. Best for small dimension tables joined frequently.\n\n**Sort Keys**: Define the order rows are stored. Range queries benefit from sort keys (BETWEEN, WHERE date > ...). Compound sort key: ordered set of columns. Interleaved sort key: equal weight to each column (better for multi-column filter queries).\n\n**Concurrency Scaling**: Automatically adds transient read capacity when query queue fills. Enables consistent performance for hundreds of concurrent users. Free credits: 1 hour per day.\n\n**Redshift ML**: Create ML models using SQL — trains SageMaker Autopilot models from Redshift data. Run inference directly in SQL queries.\n\n**Data Sharing**: Share live data across Redshift clusters or with Redshift Serverless without data movement. Producer cluster shares data, consumer clusters query it in real-time. Cross-account data sharing via AWS Data Exchange.',
          keyPoints: [
            { text: 'RA3 nodes: compute and storage scale independently. Pay for Redshift Managed Storage (like S3 pricing) separately from compute — cost-efficient for large datasets with variable query load', examTip: true },
            { text: 'Distribution KEY: co-locate rows with the same join key on the same slice — eliminates data movement during joins. Wrong distribution = expensive redistributes in every query', examTip: true },
            { text: 'Redshift Spectrum: query S3 data without loading — JOIN S3 external tables with Redshift tables. Scales compute independently for large scans. $5/TB scanned', examTip: true },
            { text: 'Concurrency Scaling: automatically adds read capacity during peak. Free 1 hour/day. For predictable concurrency, configure WLM (Workload Management) queues instead', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'performance', text: 'Choose KEY distribution for large fact tables joined to dimension tables on the same column — eliminates broadcast joins and reduces query execution time by 50-90% for join-heavy workloads' },
            { pillar: 'cost-optimization', text: 'Use Redshift Serverless for irregular analytics workloads — pay per second of compute, zero cost when idle. Reserved capacity pricing for predictable steady-state workloads' },
            { pillar: 'operational-excellence', text: 'Enable Automatic Table Optimization (ATO) — Redshift analyzes query patterns and automatically applies optimal sort keys and distribution styles without DBA intervention' },
          ],
        },
      ],
    },
  ],
};
