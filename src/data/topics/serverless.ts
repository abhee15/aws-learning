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
