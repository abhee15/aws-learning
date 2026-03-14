export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  STUDY_PLAN: '/study-plan',
  PROGRESS: '/progress',

  TOPICS: '/topics',
  TOPIC: (slug: string) => `/topics/${slug}`,

  QUIZ: '/quiz',
  QUIZ_SESSION: '/quiz/session',
  QUIZ_RESULTS: (id: string) => `/quiz/results/${id}`,

  FLASHCARDS: '/flashcards',
  FLASHCARDS_SESSION: '/flashcards/session',
} as const;

export const TOPIC_SLUGS = {
  GLOBAL_INFRA: 'global-infrastructure',
  IAM: 'iam',
  VPC: 'vpc',
  DNS_CDN: 'dns-cdn',
  COMPUTE: 'compute',
  SERVERLESS: 'serverless',
  CONTAINERS: 'containers',
  S3: 's3',
  BLOCK_FILE: 'block-file-storage',
  DATABASES: 'databases',
  MESSAGING: 'messaging',
  OBSERVABILITY: 'observability',
  SECURITY: 'security',
  IAC: 'iac',
  NETWORKING: 'networking',
  MIGRATION: 'migration',
  ANALYTICS: 'analytics',
  ML: 'ml',
  WELL_ARCHITECTED: 'well-architected',
  COST: 'cost-optimization',
  DR: 'disaster-recovery',
} as const;
