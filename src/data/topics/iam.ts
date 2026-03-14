import type { Topic } from '../../types/topic';

export const iamTopic: Topic = {
  id: 'iam',
  slug: 'iam',
  title: 'IAM, Identity & Access Management',
  shortTitle: 'IAM',
  icon: 'Shield',
  color: 'red',
  examDomains: ['organizational-complexity', 'new-solutions'],
  estimatedStudyHours: 8,
  summaryBullets: [
    'IAM controls WHO can do WHAT to WHICH AWS resources',
    'Policies are JSON documents attached to identities or resources',
    'Roles enable temporary credentials — preferred over long-term access keys',
    'AWS Organizations + SCPs control the maximum permissions in member accounts',
    'IAM Identity Center (SSO) provides centralized access to multiple accounts',
    'Permission Boundaries limit the maximum permissions a principal can grant',
    'Cross-account access uses IAM Roles + trust policies, not user credentials',
  ],
  relatedTopics: ['security', 'vpc', 'iac'],
  solutionArchitectures: [
    {
      id: 'iam-arch-multi-account',
      title: 'Enterprise Multi-Account Access with IAM Identity Center',
      description: 'Centralized SSO for all AWS accounts in an Organization. Engineers log in once to Identity Center and access any account with appropriate permissions — no per-account IAM users or static credentials.',
      useCase: 'Enterprise with 5+ AWS accounts and corporate Active Directory or Okta for identity management',
      components: [
        { name: 'AWS Organizations', role: 'Management account hosts the Organization with OUs: Security, Infrastructure, Workloads (Prod/Dev)' },
        { name: 'IAM Identity Center', role: 'Enabled in management account. Syncs users/groups from corporate IdP via SCIM provisioning' },
        { name: 'Corporate IdP (AD/Okta)', role: 'Source of identity — users and group memberships. SAML 2.0 or SCIM sync to Identity Center' },
        { name: 'Permission Sets', role: 'Define IAM policies (e.g., ReadOnly, PowerUser, Admin). Mapped to accounts + groups. Correspond to IAM Roles in each account' },
        { name: 'AWS CLI/Console', role: 'Engineers use `aws sso login` for CLI or the Identity Center portal for console. Credentials are 1-8 hour temporary tokens' },
        { name: 'Log Archive Account', role: 'Dedicated account stores CloudTrail + Config logs. SCPs prevent log deletion even from admins' },
      ],
      dataFlow: [
        'Engineer opens Identity Center portal → authenticates with corporate SSO (Okta/AD)',
        'Identity Center evaluates group membership → shows accessible accounts + permission sets',
        'Engineer selects account + permission set → Identity Center creates temporary STS credentials for that account\'s corresponding IAM Role',
        'CLI: `aws sso login` → browser flow → credentials cached locally for 1-8 hours',
        'All API calls logged to CloudTrail in the log archive account with the session identity (user + permission set)',
      ],
      keyDecisions: [
        'SCIM provisioning vs manual sync — SCIM auto-deprovisions access when user leaves (critical for offboarding)',
        'Separate Permission Sets for read-only, developer, and admin access — follow least privilege by role',
        'Enable attribute-based access control (ABAC) in Identity Center to auto-assign accounts based on user department attributes',
        'Store CloudTrail in immutable S3 bucket (Object Lock) in a separate Log Archive account with restrictive SCPs',
      ],
      tradeoffs: [
        { pro: 'Single sign-off — revoking access in the IdP immediately removes all AWS account access', con: 'Requires initial SCIM/SAML configuration with corporate IdP — not trivial for legacy on-prem AD' },
        { pro: 'Temporary credentials only — no long-lived access keys to manage or rotate', con: 'CLI credential refresh required when tokens expire (every 1-8 hours)' },
      ],
      examAngle: 'Questions about centralized human access to multiple AWS accounts → IAM Identity Center with Organization integration. Questions about per-account IAM Users for employees → wrong answer. IAM Identity Center with SCIM auto-deprovisions access on offboarding, which is a compliance requirement in regulated industries.',
    },
    {
      id: 'iam-arch-cicd-oidc',
      title: 'CI/CD Pipeline with OIDC Federation (Zero Static Keys)',
      description: 'GitHub Actions (or GitLab CI) deploy to AWS without storing any AWS credentials. The CI provider acts as an OIDC identity provider — each pipeline run receives a short-lived JWT exchanged for temporary AWS credentials.',
      useCase: 'Any CI/CD pipeline deploying to AWS — eliminates the security risk of long-lived access keys stored in CI/CD secret management',
      components: [
        { name: 'GitHub Actions', role: 'Generates an OIDC token per workflow run. Token includes claims: repository, branch, workflow, actor' },
        { name: 'IAM OIDC Provider', role: 'Configured in AWS IAM to trust GitHub\'s OIDC endpoint (token.actions.githubusercontent.com). Validates JWT signatures' },
        { name: 'IAM Deploy Role', role: 'Trust policy allows Federated principal (GitHub OIDC provider) with conditions: `repo:org/repo:ref:refs/heads/main`. Permission policy grants only required deployment permissions' },
        { name: 'AWS STS', role: 'Exchanges GitHub OIDC JWT for temporary STS credentials (1-hour session). Credentials scoped to the Deploy Role' },
        { name: 'Target Services', role: 'S3, ECR, Lambda, CloudFormation — whatever the pipeline deploys to using the temporary credentials' },
      ],
      dataFlow: [
        'GitHub Actions workflow starts → GitHub generates OIDC JWT with claims (repo, branch, commit SHA)',
        '`aws-actions/configure-aws-credentials` action calls STS AssumeRoleWithWebIdentity with the JWT',
        'STS validates JWT against IAM OIDC provider → checks trust policy conditions (repo + branch match)',
        'STS returns temporary credentials (1hr) → environment variables set in the workflow runner',
        'Subsequent steps use credentials to deploy — CloudFormation, Lambda update, ECR push, etc.',
        'Workflow ends → credentials expire. No credential stored in GitHub Secrets.',
      ],
      keyDecisions: [
        'Trust policy condition on `token.actions.githubusercontent.com:sub` — restrict to specific repo AND branch (e.g., `repo:myorg/myapp:ref:refs/heads/main`) to prevent any GitHub repo from assuming the role',
        'Separate roles per environment — DeployRole-Dev, DeployRole-Prod with different permissions and conditions (dev allows any branch, prod requires main)',
        'Add `token.actions.githubusercontent.com:aud` = `sts.amazonaws.com` condition to prevent token reuse',
      ],
      tradeoffs: [
        { pro: 'Zero static credentials — nothing to rotate, nothing to leak. Credentials are per-run and expire in 1 hour', con: 'Requires IAM OIDC provider setup and careful trust policy conditions — misconfigured conditions allow any GitHub repo to assume the role' },
        { pro: 'Full audit trail — CloudTrail records calls with GitHub workflow identity (repo + run ID)', con: 'Not supported by all CI platforms — GitHub, GitLab, CircleCI support OIDC; Jenkins requires additional setup' },
      ],
      examAngle: 'Questions about CI/CD accessing AWS securely → OIDC federation (not IAM Users with access keys). The trust policy condition `token.actions.githubusercontent.com:sub` matching `repo:ORG/REPO:ref:refs/heads/BRANCH` is the critical security control preventing any GitHub repository from assuming your deployment role.',
    },
  ],
  subtopics: [
    {
      id: 'iam-basics',
      title: 'IAM Principals & Policies',
      sections: [
        {
          id: 'iam-principals',
          title: 'IAM Principals',
          content: `An IAM Principal is an entity that can make requests to AWS. Understanding principals is foundational to all AWS security design.

**IAM User**: A permanent identity with long-term credentials — a username/password for console access and up to two access key pairs for programmatic access. Each access key consists of an Access Key ID (AKIA...) and a Secret Access Key. Access keys are shown only once at creation — if lost, they must be rotated. Use IAM Users sparingly: prefer IAM Roles for all workloads. Human users should access AWS via IAM Identity Center (SSO), not individual IAM users.

**IAM Group**: A collection of IAM Users. Policies attached to the group are inherited by all members. Groups cannot be nested (no groups within groups). A user can belong to up to 10 groups. Groups CANNOT assume roles — only individual users can.

**IAM Role**: The preferred identity for any workload. Issues temporary credentials via AWS STS (Security Token Service) — no long-term secrets to manage or rotate. A role has two required components: a Trust Policy (who can assume it) and a Permission Policy (what it can do). Any principal — an IAM user, another AWS account, an AWS service, or a federated identity — can assume a role if the trust policy allows it.

**Service Principal**: A special principal identifier that represents an AWS service. Used in role trust policies to grant services the ability to assume a role. Examples:
- \`lambda.amazonaws.com\` — allows Lambda functions to assume the role (Lambda Execution Role)
- \`ec2.amazonaws.com\` — allows EC2 instances to assume the role (Instance Profile)
- \`ecs-tasks.amazonaws.com\` — allows ECS tasks to assume the role
- \`cloudformation.amazonaws.com\` — allows CloudFormation to create resources on your behalf
- \`delivery.logs.amazonaws.com\` — allows VPC Flow Logs delivery to S3/CloudWatch

**Federated Identity**: External users authenticated by a third-party Identity Provider (IdP) who receive temporary AWS credentials via STS. No IAM User is created — the IdP assertion is mapped to an IAM Role. Three federation mechanisms:
- **SAML 2.0**: Enterprise directory (Active Directory, Okta, Ping Identity) → SAML assertion → \`AssumeRoleWithSAML\` → temporary credentials. Used for corporate employees accessing the AWS Console or APIs.
- **OIDC / Web Identity**: Social or custom OIDC IdP (Google, GitHub Actions, Kubernetes OIDC) → JWT token → \`AssumeRoleWithWebIdentity\` → temporary credentials. Used for CI/CD pipelines, mobile apps, EKS pod identities.
- **AWS IAM Identity Center (SSO)**: Managed SSO solution for multi-account AWS access. Users authenticate once and get access to multiple accounts via Permission Sets (which map to IAM Roles). Preferred for all human access to AWS accounts in an Organization.

**Root User**: The initial account login — full unrestricted access, cannot be constrained by SCPs or permission boundaries. Must be protected with MFA and hardware security key. Should never be used for daily operations. Only root can: close the account, change support plan, restore IAM admin lockout, enable MFA delete on S3.`,
          keyPoints: [
            { text: 'IAM Users have long-term credentials — avoid for production; use Roles instead', examTip: true },
            { text: 'Root account: enable MFA, delete access keys, never use for daily tasks', examTip: true },
            { text: 'Groups cannot assume roles — only users in groups can', gotcha: true },
            { text: 'A user can be in multiple groups but max 10 groups per user', examTip: true },
            { text: 'Roles issue temporary credentials via STS (15min - 12hr duration)', examTip: true },
            { text: 'Service principals in trust policies identify which AWS service can assume the role (e.g., lambda.amazonaws.com)', examTip: true },
            { text: 'Root user is NOT affected by SCPs — design so no workloads and no humans use root', gotcha: true },
            { text: 'IAM Identity Center (SSO) is the preferred method for human access to multiple AWS accounts — not individual IAM users per account', examTip: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Eliminate IAM User access keys for human users — replace with IAM Identity Center (SSO) which issues short-lived credentials via the CLI credential helper', detail: 'Access key compromise is the #1 cause of AWS account takeover incidents' },
            { pillar: 'security', text: 'Enable MFA on all IAM Users and the root account — use hardware security keys (FIDO2/WebAuthn) for root, virtual MFA at minimum for all human IAM users' },
            { pillar: 'operational-excellence', text: 'Use IAM Access Analyzer to continuously audit resource-based policies — detect any S3 buckets, roles, or KMS keys shared outside your Organization' },
            { pillar: 'security', text: 'For GitHub Actions / CI pipelines: use OIDC federation (not static access keys) — GitHub\'s OIDC provider issues short-lived tokens that assume an IAM role per workflow run' },
          ],
          useCases: [
            {
              scenario: 'A Lambda function needs to write logs to CloudWatch, read from an S3 bucket, and call DynamoDB. The team currently hard-codes AWS access keys in the Lambda environment variables.',
              wrongChoices: ['Store access keys in Secrets Manager and retrieve them in Lambda code', 'Create an IAM User for the Lambda function and rotate keys every 90 days'],
              correctChoice: 'Create an IAM Role with a trust policy for `lambda.amazonaws.com` and attach the required permissions. Assign this as the Lambda Execution Role — Lambda automatically receives temporary credentials via the execution environment.',
              reasoning: 'Lambda execution roles use service principals to grant the Lambda service permission to assume the role. Temporary credentials are automatically injected — no key management needed. Hard-coded or environment-variable credentials are a security anti-pattern.',
            },
          ],
          comparisons: [
            {
              headers: ['Principal', 'Credential Type', 'Duration', 'Best Use Case'],
              rows: [
                ['IAM User', 'Password + Access Keys', 'Permanent', 'Human admins (use sparingly)'],
                ['IAM Role', 'Temporary STS tokens', '15min–12hrs', 'EC2/Lambda/cross-account'],
                ['Federated', 'STS via IdP', 'Configured', 'SSO, SAML, Cognito users'],
                ['Service Principal', 'Automatic rotation', 'Auto-renewed', 'AWS services calling AWS'],
              ]
            }
          ]
        },
        {
          id: 'iam-policies',
          title: 'IAM Policies',
          content: `Policies are JSON documents that define permissions. Understanding policy types and evaluation order is critical for the exam.

**Policy Types:**
1. **Identity-based policies**: Attached to users, groups, roles. Define what that identity CAN do.
2. **Resource-based policies**: Attached to resources (S3 bucket policy, SNS topic policy). Define WHO can access the resource.
3. **Permission Boundaries**: Maximum permissions an identity-based policy can grant. Does NOT grant permissions itself.
4. **Organizations SCPs**: Maximum permissions for all principals in an account/OU. Applies to root user too!
5. **Session Policies**: Inline policies passed when assuming a role. Further restricts session.
6. **Access Control Lists (ACLs)**: Legacy, cross-account resource access (S3, VPC).

**Policy Evaluation Logic:**
1. Start with DENY ALL
2. Evaluate all applicable policies
3. Any explicit DENY → DENY (cannot be overridden)
4. Any explicit ALLOW → ALLOW (unless there's a deny)
5. Default = DENY if no allow found`,
          keyPoints: [
            { text: 'Explicit DENY always wins — it overrides any ALLOW', examTip: true },
            { text: 'SCPs do NOT grant permissions — they set maximum boundaries', examTip: true, gotcha: true },
            { text: 'Permission Boundaries limit what IDENTITY policies can grant — not resource policies', examTip: true, gotcha: true },
            { text: 'Resource-based policies + identity policies = cross-account access possible', examTip: true },
            { text: 'An SCP denying a service means root user in that account CANNOT use that service', examTip: true },
          ],
          mnemonics: [
            {
              id: 'policy-eval-mnemonic',
              phrase: 'DENY FIRST: D-E-N-Y',
              expansion: ['D = Default deny all', 'E = Evaluate all policies', 'N = No match = implicit deny', 'Y = Your explicit deny beats any allow'],
              category: 'acronym',
              visualCueType: 'acronym',
            }
          ]
        },
      ]
    },
    {
      id: 'roles-federation',
      title: 'Roles, Federation & STS',
      sections: [
        {
          id: 'roles-deep',
          title: 'IAM Roles Deep Dive',
          content: `IAM Roles are the cornerstone of secure AWS architecture. Roles use temporary credentials and can be assumed by any trusted entity.

**Role Trust Policy**: Defines WHO can assume the role — the "principal" in the trust relationship. Example trust policy:
- Service principal: \`{"Principal": {"Service": "lambda.amazonaws.com"}}\` — allows Lambda service to assume the role
- Another account: \`{"Principal": {"AWS": "arn:aws:iam::123456789:root"}}\` — allows any principal in that account to assume the role (still restricted by their own IAM permissions)
- Specific role in another account: \`{"Principal": {"AWS": "arn:aws:iam::123456789:role/DeployRole"}}\` — only that specific role can assume this role
- Federated principal: \`{"Principal": {"Federated": "cognito-identity.amazonaws.com"}}\` — Cognito identity pool users

**ExternalId condition**: Used in cross-account trust policies when granting access to third-party tools (SaaS vendors). Prevents confused deputy attacks where a malicious intermediary tricks an AWS service into acting on behalf of another customer. The vendor provides you with an ExternalId; you add a condition requiring it. Only the legitimate vendor knows the ExternalId to provide when calling AssumeRole.

**Common Role Patterns:**
- **EC2 Instance Profile**: Container that holds a single IAM role for EC2. The metadata service (169.254.169.254) delivers temporary credentials to applications running on the instance — rotated automatically, no credential files needed.
- **Lambda Execution Role**: Lambda assumes this role at invocation time. The execution role determines what AWS APIs the function can call. Logs are written to CloudWatch using the execution role's CloudWatch permissions.
- **Cross-Account Role**: Enables one AWS account to access resources in another. Account A creates a role with a trust policy allowing Account B. A user in Account B calls sts:AssumeRole → receives temporary credentials in Account A's context.
- **Service-Linked Role**: Predefined role created by an AWS service (e.g., AWSServiceRoleForECS). The service manages the trust policy. You cannot detach the trust policy or delete the role while the service uses it.
- **GitHub Actions OIDC Role**: Trust policy uses the GitHub OIDC provider. Workflow assumes the role without storing AWS secrets in GitHub — credentials are ephemeral per workflow run.

**STS API Operations:**
- \`AssumeRole\` — most common; assume any role you have permission to assume
- \`AssumeRoleWithWebIdentity\` — used after OIDC token exchange (GitHub Actions, Kubernetes, mobile apps via Cognito)
- \`AssumeRoleWithSAML\` — enterprise federation via SAML 2.0 assertion from corporate IdP
- \`GetSessionToken\` — get temporary creds for an existing IAM user, typically to satisfy MFA requirements
- \`GetFederationToken\` — used by custom identity brokers; issues creds scoped by an inline policy

**Role chaining**: When role A assumes role B which assumes role C, the session duration is capped at 1 hour for any chained session, regardless of the roles' maximum session durations. This is a common gotcha in complex automation pipelines.`,
          keyPoints: [
            { text: 'Always use Instance Profiles for EC2 — never embed credentials in app code', examTip: true },
            { text: 'Cross-account: the TRUSTED account has the role; the TRUSTING entity assumes it', gotcha: true },
            { text: 'Service-linked roles CANNOT be deleted while the service is using them', examTip: true },
            { text: 'ExternalId in trust policy prevents confused deputy attacks in cross-account scenarios', examTip: true },
            { text: 'Role chaining caps session duration at 1 hour regardless of max session duration', examTip: true, gotcha: true },
          ],
          bestPractices: [
            { pillar: 'security', text: 'Add ExternalId condition to all cross-account trust policies for third-party integrations — prevents confused deputy attacks where a malicious party tricks your role into acting on their behalf' },
            { pillar: 'security', text: 'Scope cross-account trust policies to specific role ARNs rather than account root — `arn:aws:iam::ACCOUNT:role/SpecificRole` is safer than `arn:aws:iam::ACCOUNT:root`' },
            { pillar: 'operational-excellence', text: 'Use GitHub Actions OIDC federation instead of AWS access keys stored in GitHub Secrets — eliminates long-lived credential management and reduces secret sprawl' },
            { pillar: 'reliability', text: 'Design automation pipelines to avoid role chaining deeper than 1 level — chained sessions cap at 1 hour and can break long-running deployments' },
          ],
          useCases: [
            {
              scenario: 'A SaaS monitoring vendor needs to read CloudWatch metrics and EC2 inventory from your AWS account to populate their dashboard. They provide you with a unique ExternalId.',
              wrongChoices: ['Create an IAM User and share the access keys with the vendor', 'Grant the vendor\'s AWS account root access to your account'],
              correctChoice: 'Create a cross-account IAM Role with a trust policy allowing the vendor\'s account principal AND a Condition requiring the specific ExternalId. Attach read-only CloudWatch and EC2 policies.',
              reasoning: 'Cross-account roles with ExternalId are the secure pattern for third-party integrations. The ExternalId prevents confused deputy attacks. No long-term credentials are shared — the vendor assumes the role using their own credentials.',
            },
          ],
        },
        {
          id: 'federation',
          title: 'Identity Federation',
          content: `Federation allows external users to access AWS without creating IAM users. This is the architecture for enterprise SSO and mobile apps.

**SAML 2.0 Federation:**
- Enterprise IdP (Active Directory, Okta, Ping) → SAML assertion → STS → AWS Console or API
- Use \`AssumeRoleWithSAML\`
- Requires SAML identity provider configured in IAM

**OIDC Federation (Web Identity):**
- Social IdP (Google, Facebook, Amazon) → OIDC token → STS → AWS
- Recommended: Use **Cognito** as intermediary (more secure, audit trail)
- Cognito User Pools = Authentication; Cognito Identity Pools = AWS credentials

**IAM Identity Center (AWS SSO):**
- Centralized SSO for multiple AWS accounts and business applications
- Integrates with AWS Organizations
- Users get permission sets, not IAM roles directly
- Preferred for enterprise multi-account access

**Custom Identity Broker:**
- You control authentication, then call STS \`GetFederationToken\`
- More complex but maximum control`,
          keyPoints: [
            { text: 'Cognito Identity Pools give unauthenticated OR authenticated users AWS credentials', examTip: true },
            { text: 'IAM Identity Center = recommended for multi-account AWS access (replaces managing roles per account)', examTip: true },
            { text: 'SAML 2.0 → Console access OR API access (different endpoint)', examTip: true },
            { text: 'Web Identity → Use Cognito, not direct federation, for mobile apps (Cognito adds features)', examTip: true },
          ],
          comparisons: [
            {
              headers: ['Federation Type', 'Protocol', 'Use Case', 'AWS Service'],
              rows: [
                ['Enterprise SSO', 'SAML 2.0', 'Corp employees, AD', 'IAM Identity Center'],
                ['Mobile/Web Apps', 'OIDC/OAuth', 'Social login', 'Cognito Identity Pools'],
                ['Multi-Account', 'IAM Identity Center', 'Org accounts', 'AWS IAM Identity Center'],
                ['Custom Broker', 'Custom', 'Legacy IdP', 'STS GetFederationToken'],
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'organizations',
      title: 'AWS Organizations & Multi-Account',
      sections: [
        {
          id: 'organizations-overview',
          title: 'AWS Organizations',
          content: `AWS Organizations enables centralized management of multiple AWS accounts. It's the foundation of enterprise AWS governance.

**Key Concepts:**
- **Management Account (Root)**: The master account that creates and manages the organization. Has special powers.
- **Member Accounts**: Regular accounts in the organization
- **Organizational Units (OUs)**: Logical groupings of accounts (e.g., Prod OU, Dev OU, Security OU)
- **SCPs (Service Control Policies)**: Permission guardrails applied to OUs or accounts
- **Consolidated Billing**: All accounts' usage combined for volume discounts

**Multi-Account Strategy Best Practices:**
- Separate accounts by: environment (dev/staging/prod), business unit, compliance boundary
- Use dedicated accounts for: logging, security (GuardDuty, Security Hub), networking (Transit Gateway hub), tooling
- The "Landing Zone" pattern uses AWS Control Tower to automate account provisioning

**Account Vending Machine Pattern:**
1. New account request → Control Tower
2. Account Factory provisions account with baseline config
3. SCPs + guardrails applied automatically
4. Account enrolled in security services (GuardDuty, Config, SecurityHub)`,
          keyPoints: [
            { text: 'SCPs affect ALL principals in the account INCLUDING the root user', examTip: true },
            { text: 'SCPs only restrict what IAM policies can allow — they do NOT grant permissions', examTip: true, gotcha: true },
            { text: 'Management account is NEVER affected by SCPs — design so no workloads run there', examTip: true },
            { text: 'Consolidated billing: RI and Savings Plans sharing across accounts by default', examTip: true },
            { text: 'Tag policies enforce consistent tagging across all accounts in the org', examTip: true },
          ],
          comparisons: [
            {
              headers: ['AWS Governance Tool', 'Purpose', 'Scope'],
              rows: [
                ['SCPs', 'Permission guardrails', 'Account/OU level'],
                ['Permission Boundaries', 'Max perms for principals', 'Principal level'],
                ['IAM Identity Center', 'Centralized SSO access', 'All org accounts'],
                ['Control Tower', 'Account vending + guardrails', 'Organization-wide'],
                ['AWS Config Rules', 'Compliance checking', 'Per account/aggregated'],
              ]
            }
          ]
        }
      ]
    }
  ]
};
