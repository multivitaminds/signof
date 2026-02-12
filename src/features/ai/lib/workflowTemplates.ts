import { AgentType } from '../types'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  stages: Array<{ agentType: AgentType; defaultTask: string }>
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'blog-post',
    name: 'Blog Post Pipeline',
    description: 'Research a topic, optimize for SEO, write the article, review quality',
    stages: [
      { agentType: AgentType.Researcher, defaultTask: 'Research the topic thoroughly' },
      { agentType: AgentType.SEO, defaultTask: 'Optimize content for search engines' },
      { agentType: AgentType.Writer, defaultTask: 'Write a compelling article' },
      { agentType: AgentType.Reviewer, defaultTask: 'Review for quality and accuracy' },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Plan the launch, design assets, create campaign, schedule social',
    stages: [
      { agentType: AgentType.Planner, defaultTask: 'Create launch plan and timeline' },
      { agentType: AgentType.Designer, defaultTask: 'Design launch assets and visuals' },
      { agentType: AgentType.Marketing, defaultTask: 'Build marketing campaign' },
      { agentType: AgentType.SocialMedia, defaultTask: 'Create social media content calendar' },
    ],
  },
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Scan vulnerabilities, check compliance, review findings, write report',
    stages: [
      { agentType: AgentType.Security, defaultTask: 'Scan for security vulnerabilities' },
      { agentType: AgentType.Compliance, defaultTask: 'Check regulatory compliance' },
      { agentType: AgentType.Reviewer, defaultTask: 'Review and validate findings' },
      { agentType: AgentType.Writer, defaultTask: 'Write the audit report' },
    ],
  },
  {
    id: 'hiring-pipeline',
    name: 'Hiring Pipeline',
    description: 'Define role, write job description, review, draft outreach',
    stages: [
      { agentType: AgentType.HR, defaultTask: 'Define role requirements and criteria' },
      { agentType: AgentType.Writer, defaultTask: 'Write the job description' },
      { agentType: AgentType.Reviewer, defaultTask: 'Review description for accuracy' },
      { agentType: AgentType.Coordinator, defaultTask: 'Draft candidate outreach communications' },
    ],
  },
  {
    id: 'financial-report',
    name: 'Financial Report',
    description: 'Gather financial data, analyze trends, write report, review',
    stages: [
      { agentType: AgentType.Finance, defaultTask: 'Gather and process financial data' },
      { agentType: AgentType.Analyst, defaultTask: 'Analyze trends and patterns' },
      { agentType: AgentType.Writer, defaultTask: 'Write the financial report' },
      { agentType: AgentType.Reviewer, defaultTask: 'Review for accuracy and completeness' },
    ],
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Loop',
    description: 'Triage feedback, analyze patterns, plan improvements, communicate changes',
    stages: [
      { agentType: AgentType.CustomerSuccess, defaultTask: 'Triage and categorize customer feedback' },
      { agentType: AgentType.Analyst, defaultTask: 'Analyze feedback patterns and trends' },
      { agentType: AgentType.Planner, defaultTask: 'Plan product improvements' },
      { agentType: AgentType.Coordinator, defaultTask: 'Communicate changes to stakeholders' },
    ],
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    description: 'Research competitors, analyze SEO, find patterns, write brief',
    stages: [
      { agentType: AgentType.Researcher, defaultTask: 'Research competitor products and strategies' },
      { agentType: AgentType.SEO, defaultTask: 'Analyze competitor SEO and keywords' },
      { agentType: AgentType.Analyst, defaultTask: 'Identify competitive patterns' },
      { agentType: AgentType.Writer, defaultTask: 'Write the competitive analysis brief' },
    ],
  },
  {
    id: 'legal-review',
    name: 'Legal Review',
    description: 'Review contract, check regulations, verify quality, summarize findings',
    stages: [
      { agentType: AgentType.Legal, defaultTask: 'Review the contract document' },
      { agentType: AgentType.Compliance, defaultTask: 'Check against regulations' },
      { agentType: AgentType.Reviewer, defaultTask: 'Verify quality and completeness' },
      { agentType: AgentType.Writer, defaultTask: 'Summarize findings and recommendations' },
    ],
  },
  {
    id: 'content-marketing',
    name: 'Content Marketing',
    description: 'Research topic, write content, optimize SEO, create social posts',
    stages: [
      { agentType: AgentType.Researcher, defaultTask: 'Research the content topic' },
      { agentType: AgentType.Writer, defaultTask: 'Write the marketing content' },
      { agentType: AgentType.SEO, defaultTask: 'Optimize for search engines' },
      { agentType: AgentType.SocialMedia, defaultTask: 'Create social media promotion posts' },
    ],
  },
  {
    id: 'devops-setup',
    name: 'DevOps Setup',
    description: 'Plan infrastructure, security review, implement, code review',
    stages: [
      { agentType: AgentType.DevOps, defaultTask: 'Plan infrastructure and CI/CD pipeline' },
      { agentType: AgentType.Security, defaultTask: 'Review security requirements' },
      { agentType: AgentType.Developer, defaultTask: 'Implement the infrastructure code' },
      { agentType: AgentType.Reviewer, defaultTask: 'Review implementation quality' },
    ],
  },
]
