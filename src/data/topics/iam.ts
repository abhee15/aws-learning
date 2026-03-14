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
  subtopics: [
    {
      id: 'iam-basics',
      title: 'IAM Principals & Policies',
      sections: [
        {
          id: 'iam-principals',
          title: 'IAM Principals',
          content: `An IAM Principal is an entity that can make requests to AWS. Understanding principals is foundational to all AWS security design.

**Types of Principals:**
- **IAM User**: Long-term credentials (username/password + access keys). Use sparingly — prefer roles.
- **IAM Group**: Collection of users. Policies attached to group apply to all members.
- **IAM Role**: Assumed by services, users, or external identities. Issues temporary credentials via STS.
- **AWS Service Principal**: Allows AWS services (Lambda, EC2) to make API calls.
- **Federated Identity**: External IdP users (Cognito, SAML, OIDC) mapped to IAM roles.

**Principal of Least Privilege:**
Grant only the minimum permissions needed. Start with zero, add as needed.`,
          keyPoints: [
            { text: 'IAM Users have long-term credentials — avoid for production; use Roles instead', examTip: true },
            { text: 'Root account: enable MFA, delete access keys, never use for daily tasks', examTip: true },
            { text: 'Groups cannot assume roles — only users in groups can', gotcha: true },
            { text: 'A user can be in multiple groups but max 10 groups per user', examTip: true },
            { text: 'Roles issue temporary credentials via STS (15min - 12hr duration)', examTip: true },
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

**Role Components:**
- **Trust Policy**: WHO can assume this role (the principal)
- **Permission Policy**: WHAT actions the role can perform
- **Session Duration**: How long the temporary credentials last (15min–12hr)
- **Role ARN**: The identifier used when assuming the role

**Common Role Patterns:**
- **EC2 Instance Profile**: Attach role to EC2 → app gets creds automatically via metadata service
- **Lambda Execution Role**: Lambda assumes this role to access AWS services
- **Cross-Account Role**: Account A role trusts Account B → Account B users can assume it
- **Service-Linked Role**: Pre-defined role for a specific AWS service (created by that service)
- **Web Identity Role**: Trust OIDC/Cognito for mobile app access

**STS API Calls:**
- \`AssumeRole\` — assume a role (most common)
- \`AssumeRoleWithWebIdentity\` — for OIDC/Cognito
- \`AssumeRoleWithSAML\` — for SAML federation
- \`GetSessionToken\` — for MFA, temp creds for IAM user
- \`GetFederationToken\` — for custom federation broker`,
          keyPoints: [
            { text: 'Always use Instance Profiles for EC2 — never embed credentials in app code', examTip: true },
            { text: 'Cross-account: the TRUSTED account has the role; the TRUSTING entity assumes it', gotcha: true },
            { text: 'Service-linked roles CANNOT be deleted while the service is using them', examTip: true },
            { text: 'ExternalId in trust policy prevents confused deputy attacks in cross-account scenarios', examTip: true },
            { text: 'Role chaining caps session duration at 1 hour regardless of max session duration', examTip: true, gotcha: true },
          ]
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
