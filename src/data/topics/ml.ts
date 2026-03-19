import type { Topic } from '../../types/topic';

export const mlTopic: Topic = {
  id: 'ml',
  slug: 'ml',
  title: 'Machine Learning: SageMaker & AI Services',
  shortTitle: 'ML/AI',
  icon: 'Brain',
  color: 'fuchsia',
  examDomains: ['new-solutions', 'cost-optimization'],
  estimatedStudyHours: 4,
  summaryBullets: [
    'SageMaker: end-to-end ML platform. Studio for notebooks, Training Jobs for distributed training, Endpoints for real-time inference',
    'SageMaker Autopilot: AutoML — automatic feature engineering, model selection, hyperparameter tuning',
    'SageMaker Savings Plans + Spot Training: up to 90% cost reduction. Checkpointing required for Spot interruption recovery',
    'AI Services (no ML expertise): Rekognition (vision), Transcribe (speech-to-text), Comprehend (NLP), Forecast, Personalize, Textract',
    'Amazon Bedrock: Foundation Models (Claude, Llama, Titan) via API. No ML infrastructure. Fine-tuning with your data.',
  ],
  relatedTopics: ['analytics', 's3', 'compute'],
  subtopics: [
    {
      id: 'ml-sagemaker',
      title: 'Amazon SageMaker',
      sections: [
        {
          id: 'ml-sagemaker-core',
          title: 'SageMaker Core Components',
          content: '**Amazon SageMaker**: Fully managed ML platform covering the entire ML lifecycle: data preparation → model training → model evaluation → deployment → monitoring.\n\n**SageMaker Studio**: Web-based IDE for ML. Jupyter notebooks with managed compute. Integrated with all SageMaker features (Training Jobs, Pipelines, Feature Store, Model Registry). Single pane of glass for the ML workflow.\n\n**SageMaker Notebooks**: Managed Jupyter Notebook instances (classic) or Studio notebooks. Access S3 data, run training jobs, visualize results. Choose instance type based on data processing needs.\n\n**Training Jobs**: Managed distributed training on any instance type. Bring your own container (BYOC) or use SageMaker built-in algorithms (XGBoost, Linear Learner, BlazingText, etc.) or frameworks (TensorFlow, PyTorch, MXNet, Scikit-learn). Training data from S3 (File mode, Pipe mode, FastFile mode).\n\n**SageMaker Spot Training**: Use EC2 Spot Instances for training jobs — up to 90% cost reduction. Must enable checkpointing to S3 so interrupted jobs can resume from last checkpoint. Use for: training jobs that can tolerate interruptions (most batch training).\n\n**Hyperparameter Tuning (HPO)**: Automated hyperparameter optimization. Strategies: Bayesian (efficient, learns from previous runs), Random (parallel, less efficient), Hyperband (early stopping for poor performers). Runs multiple training jobs in parallel.\n\n**SageMaker Autopilot**: AutoML — given a dataset and target column, automatically performs: feature engineering, algorithm selection, hyperparameter optimization, model evaluation. Returns the best model with full explainability. No ML expertise required. Used by: data analysts, business teams.\n\n**SageMaker Feature Store**: Centralized repository for ML features. Online store: low-latency feature retrieval for real-time inference. Offline store: S3-backed for batch training. Ensures training and inference use the same feature definitions — prevents training/serving skew.\n\n**SageMaker Pipelines**: CI/CD for ML workflows. Define steps (processing → training → evaluation → registration → deployment) as a DAG. Reuse steps across pipelines. Integration with CodePipeline for full MLOps.\n\n**SageMaker Model Registry**: Catalog of trained models with versioning, metadata, and approval workflows. Approve models for production deployment. Audit trail of who approved which model version.',
          keyPoints: [
            { text: 'SageMaker Spot Training: up to 90% cost savings. Requires checkpointing to S3 — without checkpoints, an interrupted job restarts from the beginning', examTip: true },
            { text: 'SageMaker Feature Store: online (low-latency inference) + offline (batch training) stores. Prevents training/serving skew by sharing feature definitions', examTip: true },
            { text: 'SageMaker Autopilot: fully automated ML pipeline with explainability. Use when business needs ML results without dedicated data scientists', examTip: true },
            { text: 'SageMaker Pipelines + Model Registry: required for production MLOps — versioned models with approval gates before production deployment', examTip: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Use Spot Training for all non-time-critical training jobs with S3 checkpointing enabled — 90% cost reduction with minimal operational change. Reserve On-Demand for time-sensitive jobs only.' },
            { pillar: 'operational-excellence', text: 'Implement SageMaker Pipelines for all production ML workflows — reproducible, versioned, auditable ML pipelines that trigger retraining on data drift or schedule' },
            { pillar: 'reliability', text: 'Enable SageMaker Model Monitor on production endpoints — detect data drift and model quality degradation automatically. Trigger retraining pipeline when drift exceeds threshold.' },
          ],
        },
        {
          id: 'ml-sagemaker-inference',
          title: 'SageMaker Inference & Deployment',
          content: '**SageMaker Inference Deployment Options**:\n\n**Real-Time Endpoints**: Persistent HTTPS endpoint for synchronous predictions. Auto-scaling: attach Application Auto Scaling policy based on InvocationsPerInstance or custom CloudWatch metrics. Multi-model endpoints: host many models on one endpoint — route requests by model name. Reduces cost for many infrequently used models.\n\n**Serverless Inference**: No instance management. Auto-scales to zero when idle. Cold start: 1-5 seconds (similar to Lambda cold start). Pay per inference (compute time + requests). Use for: intermittent, unpredictable traffic. Not suitable for latency-sensitive real-time APIs.\n\n**Async Inference**: Queue-based for large payloads or long processing time (up to 15 minutes). Client submits request → gets response URL → polls or uses SNS notification. Use for: video analysis, document processing, large batch inference.\n\n**Batch Transform**: Process large datasets offline without a persistent endpoint. Input from S3, output to S3. No server management. Use for: generating predictions for all records in a dataset (recommendation pre-computation, offline scoring).\n\n**SageMaker Inference Recommender**: Automatically benchmarks model across instance types and configurations. Recommends optimal instance type for cost/performance target. Runs load tests to find the best deployment configuration.\n\n**SageMaker Neo**: Compile ML models for target hardware (ARM, x86, GPU, edge devices). Optimized inference: 2-10x performance improvement. Supports deployment to edge devices via AWS IoT Greengrass.\n\n**Multi-Model Endpoint (MME)**: Host thousands of models on a single endpoint. SageMaker loads models from S3 into memory on demand and evicts least-recently-used models. Dramatically reduces cost for many models. Requires models to share the same framework and instance type.',
          keyPoints: [
            { text: 'Serverless Inference: zero idle cost, cold starts 1-5s. Use for sporadic low-volume inference. Real-time Endpoints: persistent, lower latency, higher cost', examTip: true },
            { text: 'Batch Transform: offline predictions on large S3 datasets without endpoint. Terminates when complete — no ongoing cost', examTip: true },
            { text: 'Multi-Model Endpoint: host thousands of models on one endpoint instance. Best for many models that each receive infrequent requests', examTip: true },
            { text: 'SageMaker Neo: compile model for edge device deployment via IoT Greengrass — run ML inference at the edge without cloud round-trip', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Use Multi-Model Endpoints for SaaS applications with one model per customer — consolidates thousands of models onto shared infrastructure, reducing endpoint cost by 99%' },
            { pillar: 'performance', text: 'Use Inference Recommender before production deployment — automated instance benchmarking finds the optimal cost/latency tradeoff without manual testing' },
            { pillar: 'reliability', text: 'Enable endpoint auto-scaling with SageMaker + Application Auto Scaling — set scale-in cooldown period to avoid thrashing during variable traffic spikes' },
          ],
          useCases: [
            {
              scenario: 'A SaaS company offers a fraud detection model to 800 customers. Each customer has their own fine-tuned model variant stored in S3. Using dedicated endpoints for each model would cost $800×instance cost per month. Traffic to each customer model is sporadic — most see fewer than 100 requests per day.',
              wrongChoices: ['Deploy all 800 models as separate real-time endpoints — 800× the endpoint cost', 'Use a single shared model — loses customer-specific tuning accuracy'],
              correctChoice: 'Deploy a SageMaker Multi-Model Endpoint (MME): one endpoint instance hosts all 800 models. SageMaker loads models from S3 on demand and evicts least-recently-used models from memory',
              reasoning: 'MME shares the endpoint infrastructure across all models. SageMaker automatically loads the requested model into memory on first invocation and evicts models when memory pressure occurs. Cost: one endpoint instead of 800. Best for many models with infrequent per-model traffic.',
            },
            {
              scenario: 'A video streaming platform needs to classify the content category (sports, news, drama) of 50 million video thumbnails stored in S3. The classification must complete within 24 hours. A real-time endpoint would be idle after the job completes.',
              wrongChoices: ['Create a real-time endpoint and call it 50 million times — endpoint sits idle after, wasting money', 'Use SageMaker Serverless Inference — cold starts would cause the 50M calls to take days'],
              correctChoice: 'Use SageMaker Batch Transform: point it at the S3 input path (50M images), it spins up instances, classifies all images in parallel, writes results to S3, then terminates — no ongoing endpoint cost',
              reasoning: 'Batch Transform is designed for exactly this pattern: large offline scoring jobs on S3 datasets. Instances are provisioned for the job duration and terminated on completion. No persistent endpoint cost. Processes millions of records in parallel much faster and cheaper than sequentially calling a real-time endpoint.',
            },
          ],
          comparisons: [
            {
              headers: ['Inference Type', 'Latency', 'Idle Cost', 'Max Payload', 'Use Case'],
              rows: [
                ['Real-Time Endpoint', 'Milliseconds', 'Hourly instance cost', '6 MB', 'Low-latency APIs, production'],
                ['Serverless', '1-5s (cold start)', 'Zero', '4 MB', 'Sporadic traffic, dev/test'],
                ['Async Inference', 'Seconds-minutes', 'Minimal (queue)', '1 GB', 'Large payloads, document processing'],
                ['Batch Transform', 'Batch (minutes-hours)', 'Zero (terminates)', 'Unlimited (S3)', 'Offline bulk scoring'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ml-ai-services',
      title: 'AWS AI Services — No ML Required',
      sections: [
        {
          id: 'ml-ai-overview',
          title: 'Managed AI Services for Common Use Cases',
          content: '**AWS AI Services**: Pre-trained ML models exposed as APIs. No ML expertise, no training data, no model management. Pay per API call.\n\n**Computer Vision**:\n- **Amazon Rekognition**: Object and scene detection, facial analysis, facial recognition, celebrity recognition, content moderation (detect explicit content), text in images, custom labels (fine-tune for your objects). Use for: security cameras, ID verification, content moderation pipelines.\n- **Amazon Textract**: Extract structured text from documents — forms, tables, key-value pairs, check boxes. Beyond OCR — understands document layout. Use for: invoice processing, mortgage document digitization, healthcare form extraction.\n\n**Natural Language Processing (NLP)**:\n- **Amazon Comprehend**: Entity recognition, sentiment analysis, key phrase extraction, PII detection, topic modeling, custom classification/entity recognizer. Serverless, batch or real-time.\n- **Amazon Comprehend Medical**: HIPAA-eligible NLP for medical text — extract diagnoses, medications, dosages, ICD-10 codes from clinical notes.\n- **Amazon Translate**: Neural machine translation. 75+ languages. Real-time and batch. Custom terminology for domain-specific terms.\n\n**Speech**:\n- **Amazon Transcribe**: Automatic speech recognition (ASR). Speaker diarization (who said what), custom vocabulary, medical transcription (Transcribe Medical). Supports 100+ languages. Streaming or batch.\n- **Amazon Polly**: Text-to-speech. Neural TTS voices. SSML for pronunciation control. Real-time streaming or batch to S3. NTTS (Neural TTS) voices indistinguishable from human.\n\n**Prediction & Personalization**:\n- **Amazon Forecast**: Time-series forecasting. Uses same technology as Amazon.com demand forecasting. Automatically selects best algorithm (DeepAR+, ARIMA, Prophet). No ML expertise needed.\n- **Amazon Personalize**: Real-time personalization and recommendation. Same technology as Amazon retail recommendations. Import interaction data → train → get real-time recommendations via API. Use for: e-commerce product recommendations, content personalization, search ranking.\n- **Amazon Kendra**: Enterprise search. Intelligent search across S3, SharePoint, Salesforce, RDS, OneDrive. Natural language queries — understands intent, not just keywords. Fine-tune with feedback.\n\n**Document Intelligence**:\n- **Amazon Fraud Detector**: Detect online fraud using ML. Train on your historical fraud data. Use for: new account fraud, payment fraud, promotional abuse.\n- **Amazon Lookout for Metrics**: Anomaly detection in business metrics (CloudWatch metrics, S3 data, Redshift). Automatically detects and explains anomalies. No ML training required.',
          keyPoints: [
            { text: 'Rekognition Custom Labels: fine-tune Rekognition for your specific objects/scenes — only need 10-100 labeled images, not thousands', examTip: true },
            { text: 'Textract vs Rekognition: Textract for structured document extraction (forms, tables, key-value pairs). Rekognition for image analysis (objects, faces, scenes)', examTip: true },
            { text: 'Amazon Personalize: bring your own interaction data (clicks, purchases, ratings). Works for any recommendation use case, not just e-commerce', examTip: true },
            { text: 'Comprehend Medical is HIPAA-eligible — use it for clinical NLP instead of general Comprehend which is not HIPAA-eligible for PHI processing', gotcha: true },
          ],
          bestPractices: [
            { pillar: 'cost-optimization', text: 'Use AI Services (Rekognition, Textract, Comprehend) before building custom SageMaker models — pre-trained APIs require no training data, no ML expertise, and no model management overhead' },
            { pillar: 'security', text: 'Use Comprehend PII detection + redaction in data pipelines before storing customer data in data lakes — automated compliance for GDPR and CCPA PII handling' },
            { pillar: 'operational-excellence', text: 'Use Amazon Fraud Detector with feedback loop — continuously retrain with confirmed fraud labels to improve detection accuracy over time' },
          ],
          useCases: [
            {
              scenario: 'A content platform needs to automatically flag uploaded videos that contain violence or adult content before they go live. The platform has no ML team and receives 100,000 video uploads per day. Each video must be reviewed within 5 minutes of upload.',
              wrongChoices: ['Train a custom SageMaker model — requires labeled training data and ML expertise they don\'t have', 'Use Amazon Rekognition object detection — it detects objects but the specific content moderation labels are in Rekognition Content Moderation, a different API'],
              correctChoice: 'Use Amazon Rekognition Content Moderation API: call DetectModerationLabels on video frames extracted from uploads. Returns labels like "Violence", "Explicit Nudity" with confidence scores. No training required',
              reasoning: 'Rekognition Content Moderation is a pre-trained API specifically for detecting explicit/inappropriate content. No ML expertise or training data needed. Integration is a simple API call. For video: use StartContentModeration (async) for full video analysis. Confidence thresholds allow tuning precision vs recall.',
            },
            {
              scenario: 'An e-commerce company wants to add product recommendations ("customers also bought") to their website. They have 3 years of order history (500M transactions) and 2M products. The team needs recommendations in under 100ms. They have no ML engineers.',
              wrongChoices: ['Build a collaborative filtering model in SageMaker — requires ML expertise and significant training infrastructure', 'Use Amazon Kendra — it\'s an enterprise search service, not a recommendation engine'],
              correctChoice: 'Use Amazon Personalize: import the purchase history as interaction data, let Personalize train recommendation models automatically, deploy the campaign endpoint. Call the GetRecommendations API in real-time from the website',
              reasoning: 'Amazon Personalize is purpose-built for product/content recommendations. It uses the same ML technology as Amazon.com\'s recommendations. Import interaction data (user + item + timestamp + event type), choose a recipe (e.g., aws-user-personalization), train, and deploy. No ML knowledge required — Personalize handles algorithm selection, training, and hosting.',
            },
          ],
          comparisons: [
            {
              headers: ['Service', 'Category', 'Use Case', 'Custom Training'],
              rows: [
                ['Rekognition', 'Vision', 'Object detection, faces, content moderation', 'Custom Labels (optional)'],
                ['Textract', 'Vision', 'Document form/table extraction, OCR++', 'No'],
                ['Comprehend', 'NLP', 'Sentiment, entities, PII, topics', 'Custom classifier (optional)'],
                ['Transcribe', 'Speech', 'Speech-to-text, diarization', 'Custom vocabulary'],
                ['Forecast', 'Prediction', 'Time-series demand forecasting', 'Your data (no ML expertise)'],
                ['Personalize', 'Prediction', 'Recommendations, ranking', 'Your interaction data'],
                ['Kendra', 'Search', 'Enterprise intelligent search', 'Feedback tuning'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ml-bedrock',
      title: 'Amazon Bedrock — Foundation Models',
      sections: [
        {
          id: 'ml-bedrock-core',
          title: 'Amazon Bedrock & Generative AI',
          content: '**Amazon Bedrock**: Fully managed service for accessing Foundation Models (FMs) via API. No infrastructure management. Pay per token. Models available: Anthropic Claude (text, vision), Meta Llama, Mistral, Amazon Titan (text, embeddings, image), Stability AI (image generation), AI21 Jurassic, Cohere.\n\n**Bedrock Core Features**:\n\n**Model invocation**: Single API (InvokeModel, Converse API) works across all model providers. Consistent interface regardless of underlying model. Stream responses for interactive applications.\n\n**Knowledge Bases for Bedrock**: Retrieval-Augmented Generation (RAG) — connect FM to your private data. Upload documents to S3 → Bedrock chunks, embeds, and stores in vector store (OpenSearch Serverless, Pinecone, Aurora PostgreSQL pgvector, MongoDB). At inference: retrieve relevant chunks → pass to FM as context → FM answers based on your data without hallucination on private info.\n\n**Bedrock Agents**: Autonomous AI agents that can take actions. Define tools (Lambda functions) and instructions. Agent plans multi-step tasks: break goal into steps → invoke tools → synthesize result → respond. Use for: automated customer service, code generation with execution, data analysis pipelines.\n\n**Fine-Tuning**: Train a base model on your domain-specific data. Requires training examples (prompt-completion pairs). Results in a custom model variant. Use for: specific writing styles, proprietary terminology, specialized domain responses. More expensive than RAG but better for style/format consistency.\n\n**Model Evaluation**: Compare model responses across multiple FMs on your test dataset. Automated metrics (BERT score, ROUGE) or human evaluation. Use to select the best model for your specific use case before production.\n\n**Bedrock Guardrails**: Content filtering for responsible AI. Block harmful topics, filter PII, enforce topic restrictions, detect hallucinations (groundedness checks). Apply consistently across all FMs without custom code.\n\n**Bedrock vs SageMaker**: Bedrock for consuming pre-trained foundation models via API. SageMaker for full ML lifecycle — training custom models from scratch, fine-tuning open-source models, deploying your own models.',
          keyPoints: [
            { text: 'Bedrock Knowledge Bases: RAG pattern — embed your documents, retrieve relevant context at query time, pass to FM. Reduces hallucination on private data without fine-tuning cost', examTip: true },
            { text: 'Bedrock Agents: multi-step autonomous workflows using Lambda tools. Use for: customer service bots that can look up orders, update records, and send emails', examTip: true },
            { text: 'RAG vs Fine-Tuning: RAG for current/updatable private data (no retraining when data changes). Fine-tuning for consistent style/format or domain-specific vocabulary', examTip: true },
            { text: 'Bedrock Guardrails: apply content filtering and PII protection consistently across all FM providers in one configuration — required for production responsible AI deployments', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Enable Bedrock Guardrails for all customer-facing FM applications — block harmful topics, detect PII, and enforce topic restrictions without custom filter code' },
            { pillar: 'cost-optimization', text: 'Use RAG (Bedrock Knowledge Bases) before fine-tuning — RAG requires no model training cost and handles dynamic data that changes frequently' },
            { pillar: 'operational-excellence', text: 'Use Bedrock Model Evaluation to benchmark FMs against your specific use case before committing to a model — different models excel at different tasks (coding vs. creative writing vs. analysis)' },
          ],
        },
      ],
    },
  ],
};
