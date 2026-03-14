import type { Topic } from '../../types/topic';

export const serverlessTopic: Topic = {
  id: 'serverless',
  slug: 'serverless',
  title: 'Serverless: Lambda, API Gateway & Step Functions',
  shortTitle: 'Serverless',
  icon: 'Zap',
  color: 'yellow',
  examDomains: ['new-solutions', 'continuous-improvement'],
  estimatedStudyHours: 7,
  summaryBullets: [
    'Lambda concurrency model: reserved vs provisioned — different purposes, different costs',
    'API Gateway: REST vs HTTP vs WebSocket — 29-second hard timeout across all types',
    'Step Functions: Standard (exactly-once, 1yr) vs Express (at-least-once, 5min)',
    'EventBridge Pipes for point-to-point; Event Bus rules for fan-out',
    'SQS visibility timeout must be >= Lambda timeout to prevent duplicate processing',
  ],
  relatedTopics: ['databases', 'messaging', 'security'],
  solutionArchitectures: [
    {
      id: 'sv-arch-async-api',
      title: 'Async API with Job Polling Pattern',
      description: 'Decouples long-running backend processing from synchronous HTTP responses using SQS + Lambda. The API returns immediately with a job ID; clients poll for completion.',
      useCase: 'Document processing, ML inference, report generation — any operation exceeding API Gateway\'s 29-second hard timeout',
      components: [
        { name: 'API Gateway', role: 'REST API — accepts POST /jobs, returns 202 Accepted + job ID. GET /jobs/{id} returns current status' },
        { name: 'Lambda (intake)', role: 'Validates request, writes job record to DynamoDB (status=PENDING), publishes message to SQS' },
        { name: 'SQS Queue', role: 'Durable buffer between intake and processing. Decouples caller from worker throughput' },
        { name: 'Lambda (worker)', role: 'Polls SQS, processes job, writes result to DynamoDB (status=COMPLETE), publishes completion event to EventBridge' },
        { name: 'DynamoDB', role: 'Job status store — PK=jobId, attributes: status, createdAt, result, error' },
        { name: 'EventBridge', role: 'Optional: fan-out completion events to SNS (email), SQS (downstream systems), or WebSocket callback' },
      ],
      dataFlow: [
        'Client → POST /process → API Gateway → Lambda (intake): validate + write DynamoDB status=PENDING + enqueue SQS → return 202 + jobId',
        'SQS → Lambda (worker): fetch job details, execute long-running processing',
        'Lambda (worker) → DynamoDB: update status=COMPLETE, write result',
        'Lambda (worker) → EventBridge: publish job.completed event',
        'Client → GET /jobs/{jobId} → Lambda (status) → DynamoDB → return status + result when complete',
      ],
      keyDecisions: [
        'SQS visibility timeout = 6× Lambda worker timeout — prevents duplicate processing during execution',
        'DynamoDB TTL on job records — auto-expire results after 24-48 hours to control storage costs',
        'SQS Dead Letter Queue with CloudWatch alarm — capture and alert on processing failures',
        'Use SQS FIFO only if job ordering matters within a group — Standard queue is cheaper and scales better',
      ],
      tradeoffs: [
        { pro: 'Handles operations of any duration without timeout constraints', con: 'Client complexity — must implement polling or WebSocket listener' },
        { pro: 'Worker failures don\'t affect API availability; queue absorbs traffic spikes', con: 'Eventually consistent result delivery — not suitable for real-time interactive operations' },
      ],
      examAngle: 'When a question describes operations exceeding 29 seconds OR "decouple processing from the API response", the async job pattern (SQS + polling or WebSocket callback) is the answer. Never "increase API Gateway timeout".',
    },
    {
      id: 'sv-arch-event-driven-microservices',
      title: 'Event-Driven Microservices with EventBridge',
      description: 'Loosely coupled microservices communicate through a central event bus. Each service publishes domain events; subscribers react independently without direct service coupling.',
      useCase: 'Multi-service e-commerce platforms, order management systems, any system where services must react to changes in other services without tight coupling',
      components: [
        { name: 'Service A (Order)', role: 'Publishes domain events to EventBridge custom bus: order.created, order.cancelled, order.shipped' },
        { name: 'EventBridge Bus', role: 'Central event router — rules match events by source/detail-type/detail fields and route to targets' },
        { name: 'Service B (Inventory)', role: 'Subscribes to order.created → reserve stock. Subscribes to order.cancelled → release stock' },
        { name: 'Service C (Notifications)', role: 'Subscribes to order.shipped → send customer email/SMS via SES/SNS' },
        { name: 'Service D (Analytics)', role: 'Subscribes to all order events → write to Kinesis Data Firehose → S3 → Athena' },
        { name: 'EventBridge Archive', role: 'Archives all events for 30 days — enables replay to backfill new services or recover from bugs' },
      ],
      dataFlow: [
        'Order service publishes PutEvents to EventBridge custom bus with detail-type="order.created"',
        'EventBridge evaluates all rules — rule for Inventory (source=order-service, detail-type=order.created) matches',
        'EventBridge invokes Inventory Lambda, Notifications Lambda, Analytics Kinesis in parallel (fan-out)',
        'Each service processes the event independently — failures in one service do not affect others',
        'Failed deliveries retry with exponential backoff — configure dead-letter SQS per rule target',
      ],
      keyDecisions: [
        'EventBridge Pipes for point-to-point (single source → single target with filtering/enrichment)',
        'Event Bus rules for fan-out (one event → multiple services in parallel)',
        'Schema Registry: define and enforce event contracts — prevent schema drift breaking consumers',
        'Archive + Replay: replay events after consumer bug fix to reprocess historical events',
      ],
      tradeoffs: [
        { pro: 'Services are fully decoupled — adding new consumers requires no changes to producers', con: 'Eventual consistency — consumers may process events out of order or with delay' },
        { pro: 'Event Archive enables replaying history for new services or disaster recovery', con: 'Debugging distributed event flows requires centralized observability (X-Ray, CloudWatch)' },
      ],
      examAngle: 'EventBridge Pipes vs Event Bus rules is a common exam question. Pipes = one source → one target with optional Lambda enrichment. Bus rules = one-to-many fan-out. Archive/Replay solves "new service needs historical data" scenarios.',
    },
    {
      id: 'sv-arch-saga-pattern',
      title: 'Saga Pattern with Step Functions',
      description: 'Manages distributed transactions across multiple microservices using choreography or orchestration. Each step either completes successfully or triggers compensating transactions to roll back.',
      useCase: 'Multi-step financial transactions, travel booking (flight + hotel + car), order fulfillment requiring atomic business operations across independent services',
      components: [
        { name: 'Step Functions', role: 'Orchestrator — defines the saga as a state machine with Task states for each service call and Catch states for compensation' },
        { name: 'Lambda (each step)', role: 'Calls downstream service (payment, inventory, shipping). Returns success or throws error to trigger compensation' },
        { name: 'Compensation Lambdas', role: 'Reverse operations: refund payment, release inventory, cancel shipment. Invoked by Catch states on failure' },
        { name: 'DynamoDB', role: 'Saga log — records each step completion for idempotency. Prevents duplicate charges on retry' },
        { name: 'SQS (per service)', role: 'Optional buffer between saga steps and services for backpressure management' },
      ],
      dataFlow: [
        'Client triggers saga → Step Functions starts execution with order details as input',
        'State 1: Reserve Inventory Lambda → success → continue. Failure → jump to compensation flow',
        'State 2: Charge Payment Lambda → success → continue. Failure → invoke Release Inventory + return error',
        'State 3: Schedule Shipment Lambda → success → mark saga COMPLETE',
        'Any failure triggers Catch → executes compensating transactions in reverse order → saga marked FAILED with reason',
      ],
      keyDecisions: [
        'Use Standard Workflows for exactly-once execution semantics — critical for payment operations',
        'Design all operations to be idempotent — retries must not cause double-charges (use DynamoDB conditional writes)',
        'Compensating transactions must also be idempotent — partial rollbacks on compensation failure must be safe to retry',
        'waitForTaskToken for async steps (e.g., payment processor webhook) — pauses saga until callback',
      ],
      tradeoffs: [
        { pro: 'Provides distributed transaction semantics without a 2-phase commit or distributed DB', con: 'Compensation logic must be designed upfront — harder to add retroactively' },
        { pro: 'Visual execution history in Step Functions console aids debugging', con: 'Eventual consistency during saga execution — intermediate states are visible' },
      ],
      examAngle: 'When a question involves coordinating multiple services into an atomic business transaction with rollback capability, Step Functions Saga is the answer. Standard Workflow (not Express) for exactly-once payment semantics.',
    },
  ],
  subtopics: [
    {
      id: 'sv-lambda',
      title: 'Lambda Deep Dive',
      sections: [
        {
          id: 'sv-lambda-concurrency',
          title: 'Lambda Concurrency Models',
          content: '**Reserved Concurrency** reserves a specific number of concurrent executions for a function from the account-level pool (default 1000/region). It **caps** the function at N executions — useful for protecting downstream services from being overwhelmed. Does NOT eliminate cold starts.\n\n**Provisioned Concurrency** pre-initializes execution environments that are ready to serve requests instantly — eliminating cold starts. More expensive (charged even when idle). Use for latency-sensitive APIs. Can be combined with Application Auto Scaling to scale provisioned concurrency on a schedule (e.g., before market open) or based on utilization.\n\n**Concurrency formula**: Concurrency = (invocations per second) × (average execution duration in seconds). At 100 req/s with 200ms avg = 20 concurrent executions.\n\n**Burst limits**: In us-east-1, us-west-2, eu-west-1: initial burst of 3,000 then +500/minute until limit. Other regions: 500 burst, +500/minute.',
          keyPoints: [
            { text: 'Reserved Concurrency = cap + dedicated allocation. Does NOT warm up instances — cold starts still happen', examTip: true },
            { text: 'Provisioned Concurrency = pre-warmed, no cold starts. Costs even when not invoked', examTip: true },
            { text: 'Reserve concurrency for Lambda functions that call rate-limited downstream services (e.g., RDS, external APIs)', examTip: true },
            { text: 'Account-level concurrency limit (default 1000/region) is shared across all functions — one function can starve others', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Set reserved concurrency on critical functions to guarantee capacity even when other functions scale unexpectedly', detail: 'Prevents noisy-neighbor starvation within the shared account concurrency pool' },
            { pillar: 'performance', text: 'Use Provisioned Concurrency with Application Auto Scaling for latency-sensitive APIs instead of always-on provisioning', detail: 'Schedule scale-up before known traffic peaks (market open, batch jobs) to minimize idle cost' },
            { pillar: 'cost-optimization', text: 'Monitor concurrency metrics and right-size reserved concurrency — over-reserving blocks capacity from other functions unnecessarily' },
            { pillar: 'operational-excellence', text: 'Set CloudWatch alarms on ConcurrencyLimitExceeded to detect throttling before it impacts users' },
          ],
          useCases: [
            {
              scenario: 'A trading platform Lambda processes market orders and calls a rate-limited external pricing API (max 50 req/s). During peak hours, Lambda scales to 200+ concurrent executions and the pricing API starts rejecting calls with 429 errors.',
              wrongChoices: ['Increase the pricing API rate limit (you don\'t control it)', 'Use Provisioned Concurrency to fix the 429 errors'],
              correctChoice: 'Set Reserved Concurrency on the Lambda to cap it at 50 concurrent executions, matching the pricing API limit',
              reasoning: 'Reserved Concurrency caps max concurrent executions, protecting the downstream rate-limited API. Provisioned Concurrency warms up instances — it does not limit throughput.',
            },
            {
              scenario: 'A user-facing checkout API Lambda is experiencing 300-500ms cold starts during flash sales when traffic spikes from near-zero. P99 latency is unacceptable.',
              wrongChoices: ['Use Reserved Concurrency to eliminate cold starts', 'Increase Lambda memory allocation (cold start is JVM init, not memory-bound)'],
              correctChoice: 'Enable Provisioned Concurrency and configure Application Auto Scaling to scale up 15 minutes before known sale windows',
              reasoning: 'Provisioned Concurrency pre-warms execution environments, eliminating cold starts. Auto Scaling avoids paying for idle provisioned capacity between sales.',
            },
          ],
        },
        {
          id: 'sv-lambda-cold-start',
          title: 'Cold Starts and Performance',
          content: '**Cold start** occurs when Lambda must initialize a new execution environment: download code, start runtime, run initialization code outside the handler. Duration: ~100ms (Python/Node.js) to ~1-3s (Java with Spring).\n\n**Mitigation strategies**: Provisioned Concurrency (pre-warmed), Lambda SnapStart for Java (snapshot of initialized environment), keep functions warm (event bridge ping — not recommended, use Provisioned instead), reduce package size (tree-shaking, layer optimization), lazy initialization of heavy resources.\n\n**Lambda SnapStart** (Java only): Lambda takes a snapshot of the initialized execution environment and caches it. Resume from snapshot instead of re-initialization. Reduces cold start by up to 10x for Java. Requires `SnapStart: PublishedVersions` in config.\n\n**VPC Lambda cold starts**: Lambda functions in a VPC require ENI creation (was slow, now pre-provisioned by AWS — no longer a significant issue since 2020 Hyperplane update).\n\n**Execution environment reuse**: Between invocations, Lambda may reuse the same container. Variables initialized outside the handler persist (database connection reuse, SDK clients). However, NEVER assume reuse — always handle the case where the environment is fresh.',
          keyPoints: [
            { text: 'Lambda SnapStart reduces Java cold starts by caching post-init snapshot — only for Java, requires function version', examTip: true },
            { text: 'Global scope variables persist between warm invocations — use for DB connection pooling, but handle initialization failures', examTip: true },
            { text: 'VPC Lambda cold start issue was fixed in 2020 with Hyperplane ENIs — no longer a significant latency concern', examTip: true },
          ],
        },
        {
          id: 'sv-lambda-triggers',
          title: 'Lambda Event Sources & Integration',
          content: '**Synchronous triggers**: API Gateway, ALB, Cognito, Lex, Alexa, CloudFront (Lambda@Edge). Lambda returns response directly. Errors propagate to caller.\n\n**Asynchronous triggers**: S3 events, SNS, EventBridge, CloudWatch Events, CodeCommit, CodePipeline. Lambda retries failed executions twice. Configure Dead Letter Queue (SQS or SNS) for failed async invocations. Event Age and Retry settings configurable.\n\n**Stream/Queue triggers (polling)**: SQS (Lambda polls the queue), Kinesis Data Streams, DynamoDB Streams, MSK, self-managed Kafka. Lambda manages the polling infrastructure. Key settings:\n- **SQS**: Batch size (1-10,000), batch window, bisect-on-error, partial batch failure reporting, visibility timeout >= 6× function timeout\n- **Kinesis**: Batch size, parallelization factor (1-10 per shard), bisect-on-error, iterator position (TRIM_HORIZON, LATEST, AT_TIMESTAMP)\n\n**Lambda@Edge vs CloudFront Functions**: Lambda@Edge runs at regional edge caches (not all edge locations), supports Node.js/Python, up to 5s at origin events, 1s at viewer events, no environment variables, must be in us-east-1, 128MB memory. CloudFront Functions: pure JavaScript, sub-ms execution, viewer request/response only, cheapest, run at ALL edge locations.',
          keyPoints: [
            { text: 'SQS visibility timeout must be at least 6× Lambda timeout. Otherwise Lambda retries before the first execution completes', gotcha: true },
            { text: 'Lambda@Edge cannot have environment variables, cannot access VPC, must be deployed in us-east-1, limited memory (128MB)', gotcha: true },
            { text: 'Kinesis parallelization factor (up to 10 per shard) allows up to 10 concurrent Lambda invocations per shard for higher throughput', examTip: true },
            { text: 'For partial batch failure (SQS FIFO): report batch item failures so Lambda only retries failed items, not the whole batch', examTip: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Always configure a Dead Letter Queue (SQS or SNS) on async Lambda invocations to capture and inspect failed events', detail: 'Without a DLQ, failed async invocations are silently discarded after 2 retries' },
            { pillar: 'reliability', text: 'Set SQS visibility timeout to at least 6× the Lambda function timeout to prevent duplicate processing during execution' },
            { pillar: 'performance', text: 'Use Kinesis parallelization factor (up to 10) to scale Lambda concurrency without adding shards — lower cost than re-sharding' },
            { pillar: 'operational-excellence', text: 'Enable partial batch failure reporting for SQS event sources to avoid reprocessing successfully handled messages on partial failures' },
          ],
          useCases: [
            {
              scenario: 'An S3 event triggers a Lambda to process uploaded files. Files occasionally fail processing due to transient downstream errors. The team is losing events because failed invocations produce no alerts.',
              wrongChoices: ['Use SQS as the Lambda trigger instead (changes the architecture)', 'Increase Lambda timeout and retry count'],
              correctChoice: 'Configure a Dead Letter Queue on the async Lambda event source mapping and set an SNS/CloudWatch alarm on the DLQ depth',
              reasoning: 'S3 events trigger Lambda asynchronously. After 2 retries, failures are dropped unless a DLQ is configured. The DLQ captures failed events for investigation and reprocessing.',
            },
          ],
        },
      ],
    },
    {
      id: 'sv-apigw',
      title: 'API Gateway',
      sections: [
        {
          id: 'sv-apigw-types',
          title: 'REST vs HTTP vs WebSocket APIs',
          content: '**REST API**: Full-featured API Gateway with request/response transformation, API keys, usage plans, caching (TTL 0-3600s), request validation, custom domain names, WAF integration, resource policies. More expensive. Supports Lambda, HTTP backends, AWS service integrations, Mock responses.\n\n**HTTP API**: Simplified, cheaper (~70% less than REST), lower latency, supports JWT authorizers (Cognito/OIDC), Lambda/HTTP backends. No caching, no WAF, no request transformation, no usage plans. Best for simple Lambda proxy APIs.\n\n**WebSocket API**: Bidirectional real-time communication. Manages connection state. Lambda handles $connect, $disconnect, $default routes. Connection IDs stored (typically in DynamoDB). Use for chat, live dashboards, gaming.\n\n**Hard limit: 29-second integration timeout** applies to ALL types (REST, HTTP, WebSocket). Cannot be extended. For long-running operations: use async pattern (SQS/SNS) + polling or WebSocket callback.\n\n**Throttling**: Account-level default 10,000 req/s (can increase). Stage-level and method-level throttling. Usage plans + API keys for per-client rate limiting.',
          keyPoints: [
            { text: 'API Gateway 29-second timeout is a HARD limit — cannot be increased. Design long operations to be async', gotcha: true },
            { text: 'HTTP API is ~70% cheaper than REST API but lacks caching, WAF, request transformation, and usage plans', examTip: true },
            { text: 'Private API Gateway with VPC endpoint — resource policy required to allow VPC endpoint access', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Attach WAF WebACL to REST APIs in production for OWASP protection and rate limiting at the edge', detail: 'HTTP API does not support WAF — use REST API if WAF is a security requirement' },
            { pillar: 'cost-optimization', text: 'Prefer HTTP API over REST API for simple Lambda proxy integrations — 70% cheaper with identical core functionality' },
            { pillar: 'reliability', text: 'Design operations exceeding 29 seconds as async workflows: accept request → return 202 → use SQS/Step Functions → poll or webhook for result' },
            { pillar: 'performance', text: 'Enable API Gateway caching for read-heavy endpoints with stable responses — reduces Lambda invocations and downstream DB load' },
            { pillar: 'operational-excellence', text: 'Use API Gateway Access Logging to CloudWatch for per-request visibility including latency, status codes, and caller identity' },
          ],
          useCases: [
            {
              scenario: 'A mobile app backend needs per-user rate limiting (100 req/min per user), request body validation, and must integrate with a WAF for OWASP protection.',
              wrongChoices: ['Use HTTP API — it supports JWT but not WAF or usage plans', 'Use WebSocket API — it\'s for real-time bidirectional communication'],
              correctChoice: 'Use REST API with WAF WebACL attachment, Lambda authorizer for per-user identity, and Usage Plans with API Keys for rate limiting',
              reasoning: 'Only REST API supports WAF integration, usage plans, and request validation. HTTP API is cheaper but lacks these enterprise features.',
            },
            {
              scenario: 'A document processing endpoint takes 3-4 minutes to complete. API Gateway returns 504 timeout errors on every request.',
              wrongChoices: ['Increase API Gateway timeout beyond 29 seconds', 'Increase Lambda timeout to match processing time'],
              correctChoice: 'Refactor to async: API Gateway → Lambda returns 202 with job ID, SQS → processing Lambda → DynamoDB result store, client polls /status/{jobId}',
              reasoning: 'API Gateway has a hard 29-second limit. Long-running operations must be decoupled using an async pattern with polling or WebSocket callbacks.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'REST API', 'HTTP API', 'WebSocket API'],
              rows: [
                ['Caching', 'Yes (TTL configurable)', 'No', 'No'],
                ['WAF Integration', 'Yes', 'No', 'No'],
                ['JWT Authorizer', 'No (use Lambda)', 'Yes (native)', 'No'],
                ['Usage Plans/API Keys', 'Yes', 'No', 'No'],
                ['Request Transform', 'Yes (VTL)', 'No', 'No'],
                ['Cost (relative)', '~$3.50/M', '~$1.00/M', 'Per message'],
                ['Timeout', '29 seconds', '29 seconds', 'Per frame'],
              ],
            },
          ],
        },
        {
          id: 'sv-apigw-auth',
          title: 'API Gateway Authorizers',
          content: '**Lambda Authorizer (Token)**: Validates JWT, OAuth token, or API key. Returns IAM policy document. Can cache response for TTL. Types: TOKEN (authorization header) or REQUEST (headers, query params, stage variables).\n\n**Cognito User Pool Authorizer**: Validates Cognito JWT directly — no Lambda needed. Only supported by REST API (not HTTP API). HTTP API has native JWT authorizer for Cognito.\n\n**IAM Authorization**: Caller signs requests with SigV4. Requires caller to have execute-api:Invoke IAM permission. Used for service-to-service calls within AWS.',
          keyPoints: [
            { text: 'Lambda authorizer result can be cached — set appropriate TTL to reduce Lambda invocations for high-traffic APIs', examTip: true },
            { text: 'Cognito authorizer on REST API = Cognito User Pool only. For HTTP API = native JWT authorizer (Cognito or any OIDC)', examTip: true },
          ],
        },
      ],
    },
    {
      id: 'sv-stepfunctions',
      title: 'Step Functions',
      sections: [
        {
          id: 'sv-sf-types',
          title: 'Standard vs Express Workflows',
          content: '**Standard Workflows**: Duration up to 1 year. Exactly-once execution semantics. Full execution history visible in console for 90 days. Priced per state transition ($0.025/1000). Use for long-running, business-critical workflows where exactly-once and audit trail matter: order fulfillment, approval workflows, data pipelines.\n\n**Express Workflows**: Maximum 5 minutes. At-least-once execution (may re-run on failure). No visual execution history in console — must use CloudWatch Logs. Much cheaper (priced per duration, not per state transition). Suitable for high-volume, short-duration event processing: IoT data ingestion, streaming data processing, microservice orchestration.\n\n**State Types**: Task (invoke Lambda/service), Choice (conditional branching), Wait (pause for duration/timestamp), Parallel (run branches concurrently), Map (iterate over array), Pass (pass/transform data), Succeed, Fail.\n\n**waitForTaskToken pattern**: Long-running async integrations. Lambda receives task token, does async work, calls back with SendTaskSuccess/Failure. Pauses workflow until callback — no polling. Example: human approval, external system callback.\n\n**Error handling**: Each Task state can have Retry (exponential backoff, max attempts) and Catch (redirect to error handling state). Step Functions automatically retries Lambda throttles.',
          keyPoints: [
            { text: 'Standard = exactly-once, up to 1yr, history in console. Express = at-least-once, max 5min, history in CloudWatch only', examTip: true },
            { text: 'waitForTaskToken enables async human-in-the-loop or external system integrations without polling', examTip: true },
            { text: 'Map state has concurrency limit — set maxConcurrency to avoid overwhelming downstream services', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'reliability', text: 'Add Retry and Catch blocks to every Task state in production workflows — Lambda throttles, transient API failures, and timeouts are common', detail: 'Use exponential backoff (intervalSeconds, backoffRate, maxAttempts) to avoid hammering downstream services' },
            { pillar: 'reliability', text: 'Set maxConcurrency on Map states to prevent fan-out from overwhelming downstream databases or APIs' },
            { pillar: 'cost-optimization', text: 'Use Express Workflows for high-volume, short-duration event processing (IoT, streaming) — per-duration pricing is orders of magnitude cheaper than per-state-transition Standard pricing at scale' },
            { pillar: 'operational-excellence', text: 'Enable CloudWatch logging for Express Workflows — unlike Standard, execution history is not stored in the console' },
            { pillar: 'security', text: 'Limit Step Functions IAM role permissions to only the specific services and resources accessed in the workflow — avoid wildcard resource ARNs' },
          ],
          useCases: [
            {
              scenario: 'An e-commerce order fulfillment workflow involves: payment processing, inventory reservation, shipping label generation, and customer notification. The workflow can take up to 30 minutes if shipping label API is slow. Every order must be processed exactly once.',
              wrongChoices: ['Express Workflow — at-least-once semantics could process an order payment twice', 'Lambda orchestration — hard to manage timeouts, retries, and state'],
              correctChoice: 'Standard Workflow with Task states for each step, Retry on transient errors, and Catch blocks that redirect to compensation states on failure',
              reasoning: 'Standard Workflows provide exactly-once execution and audit trail. Long duration (up to 1yr) handles slow external services. Retry/Catch handles transient failures without custom code.',
            },
          ],
          comparisons: [
            {
              headers: ['Feature', 'Standard Workflow', 'Express Workflow'],
              rows: [
                ['Max duration', '1 year', '5 minutes'],
                ['Execution semantics', 'Exactly-once', 'At-least-once'],
                ['Pricing', 'Per state transition', 'Per duration + invocations'],
                ['Execution history', 'Console (90 days)', 'CloudWatch Logs only'],
                ['Use case', 'Business processes, approvals', 'High-volume event processing'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sv-eventbridge',
      title: 'EventBridge',
      sections: [
        {
          id: 'sv-eb-patterns',
          title: 'EventBridge Architecture Patterns',
          content: '**Default Event Bus**: Receives AWS service events (EC2 state changes, S3 object creation, CodePipeline state changes). Rules filter and route to targets.\n\n**Custom Event Buses**: Applications publish events to custom buses. Enables decoupling — producers don\'t know consumers. Cross-account event publishing supported.\n\n**EventBridge Pipes**: Point-to-point integration between a single source and target with optional filtering, enrichment (Lambda/API GW/StepFunctions), and transformation. Sources: SQS, Kinesis, DynamoDB Streams, MSK, self-managed Kafka. Targets: Lambda, Step Functions, SQS, SNS, API destination. Replaces simple event-driven Lambda glue code.\n\n**Schema Registry**: Automatically discovers and stores schemas for events on the event bus. Enables code binding generation (TypeScript, Java, Python) — type-safe event handling.\n\n**Archive and Replay**: Archive events from a bus to replay them later — useful for testing, backfilling, and recovery from consumer failures.\n\n**Scheduler**: Cron or rate-based schedules that can invoke any AWS service target without needing a Lambda wrapper.',
          keyPoints: [
            { text: 'EventBridge Pipes = point-to-point (one source → one target). Event Bus rules = one-to-many fan-out. Choose based on pattern', examTip: true },
            { text: 'EventBridge has a limit of 300 rules per event bus — consider multiple buses for large fan-out architectures', gotcha: true },
            { text: 'Archive/Replay enables event sourcing patterns — replay events after consumer bugs are fixed', examTip: true },
          ],
        },
      ],
    },
  ],
};
