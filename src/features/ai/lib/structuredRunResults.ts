import type { StructuredRunResult } from '../types'

const STRUCTURED_RESULTS: Record<string, StructuredRunResult> = {
  researcher: {
    summary: 'Research complete. Key findings compiled from 12 sources across your workspace.',
    metrics: [
      { label: 'Sources Analyzed', value: '12', color: '#6366F1' },
      { label: 'Data Points', value: '847', color: '#10B981' },
      { label: 'Patterns Found', value: '3', trend: 'up', color: '#F59E0B' },
      { label: 'Efficiency Gain', value: '+23%', trend: 'up', color: '#059669' },
    ],
    actions: [
      { label: 'Review research in workspace', description: 'Open workspace pages to review collected findings', link: '/pages', priority: 'high', icon: 'FileText' },
      { label: 'Explore raw data sources', description: 'View databases where data was collected', link: '/data', priority: 'medium', icon: 'Database' },
      { label: 'Save findings to memory', description: 'Store key insights in Copilot memory for future reference', link: '/copilot/memory', priority: 'medium', icon: 'Brain' },
    ],
    suggestions: [
      { title: 'Automate Recurring Research', description: 'Set up a pipeline to run this research weekly', link: '/copilot/agents', buttonLabel: 'Create Pipeline', icon: 'Zap' },
      { title: 'Build a Dashboard', description: 'Visualize these findings in a database view', link: '/data', buttonLabel: 'Create Database', icon: 'BarChart3' },
      { title: 'Share with Team', description: 'Create a workspace page with the research summary', link: '/pages/new', buttonLabel: 'Create Page', icon: 'Share2' },
    ],
  },

  writer: {
    summary: 'Document draft complete — 1,247 words structured across 5 sections with supporting evidence.',
    metrics: [
      { label: 'Word Count', value: '1,247', color: '#6366F1' },
      { label: 'Sections', value: '5', color: '#10B981' },
      { label: 'Readability', value: '78/100', trend: 'up', color: '#F59E0B' },
      { label: 'Data Visuals', value: '2', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'Open in Document Builder', description: 'Edit and finalize the draft in the document builder', link: '/documents/builder', priority: 'high', icon: 'FileText' },
      { label: 'Create workspace page', description: 'Publish as a workspace page for team collaboration', link: '/pages/new', priority: 'medium', icon: 'BookOpen' },
      { label: 'Send for signing', description: 'Route the document for digital signatures', link: '/documents', priority: 'low', icon: 'PenTool' },
    ],
    suggestions: [
      { title: 'Run a Review', description: 'Have the Reviewer Agent check quality and compliance', link: '/copilot/agents', buttonLabel: 'Start Review', icon: 'CheckSquare' },
      { title: 'Track Document Analytics', description: 'Monitor views, signatures, and engagement', link: '/documents/analytics', buttonLabel: 'View Analytics', icon: 'BarChart3' },
      { title: 'Add to Project', description: 'Attach this document to an active project', link: '/projects', buttonLabel: 'Open Projects', icon: 'FolderOpen' },
    ],
  },

  developer: {
    summary: 'Implementation complete — 8 files modified, all tests passing with 100% coverage.',
    metrics: [
      { label: 'Files Modified', value: '8', color: '#6366F1' },
      { label: 'Lines Added', value: '312', color: '#10B981' },
      { label: 'Tests Passing', value: '8/8', trend: 'up', color: '#059669' },
      { label: 'Build Status', value: 'Pass', color: '#10B981' },
    ],
    actions: [
      { label: 'View API documentation', description: 'Check the updated API docs for new endpoints', link: '/developer/api', priority: 'high', icon: 'BookOpen' },
      { label: 'Configure webhooks', description: 'Set up webhooks for the new integration', link: '/developer/webhooks', priority: 'medium', icon: 'Globe' },
      { label: 'Link to project', description: 'Track this implementation in your project board', link: '/projects', priority: 'medium', icon: 'ClipboardList' },
    ],
    suggestions: [
      { title: 'Run Security Scan', description: 'Have the Security Agent audit the new code', link: '/copilot/agents', buttonLabel: 'Start Scan', icon: 'Shield' },
      { title: 'Set Up CI/CD', description: 'Configure deployment pipeline for this feature', link: '/developer/webhooks', buttonLabel: 'Configure', icon: 'Server' },
      { title: 'Test in Sandbox', description: 'Try the new API endpoints in the developer sandbox', link: '/developer/sandbox', buttonLabel: 'Open Sandbox', icon: 'Code2' },
    ],
  },

  designer: {
    summary: 'Design deliverables ready — 8 screens designed, WCAG 2.1 AA compliant, responsive across all breakpoints.',
    metrics: [
      { label: 'Screens', value: '8', color: '#EC4899' },
      { label: 'Components', value: '12', color: '#8B5CF6' },
      { label: 'Design Tokens', value: '24', color: '#F59E0B' },
      { label: 'Accessibility', value: 'AA', color: '#10B981' },
    ],
    actions: [
      { label: 'Review appearance settings', description: 'Update theme tokens and brand colors', link: '/settings/appearance', priority: 'high', icon: 'Palette' },
      { label: 'Create design doc', description: 'Publish specs as a workspace page', link: '/pages/new', priority: 'medium', icon: 'FileText' },
      { label: 'Attach to project', description: 'Link design deliverables to the project', link: '/projects', priority: 'medium', icon: 'FolderOpen' },
    ],
    suggestions: [
      { title: 'Hand Off to Developer', description: 'Have the Developer Agent implement the designs', link: '/copilot/agents', buttonLabel: 'Start Build', icon: 'Code2' },
      { title: 'Store Brand Guidelines', description: 'Save design tokens in Copilot memory for consistency', link: '/copilot/memory', buttonLabel: 'Save to Memory', icon: 'Brain' },
      { title: 'Schedule Review Meeting', description: 'Book a design review with stakeholders', link: '/calendar/events', buttonLabel: 'Schedule', icon: 'Calendar' },
    ],
  },

  analyst: {
    summary: 'Analysis report generated — 2,340 data points analyzed, 3 upward trends and 1 anomaly detected.',
    metrics: [
      { label: 'Data Points', value: '2,340', color: '#6366F1' },
      { label: 'Trends Found', value: '3', trend: 'up', color: '#10B981' },
      { label: 'Anomalies', value: '1', trend: 'down', color: '#EF4444' },
      { label: 'Charts', value: '4', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'View financial reports', description: 'See full accounting reports and dashboards', link: '/accounting/reports', priority: 'high', icon: 'BarChart3' },
      { label: 'Explore in databases', description: 'Drill into the raw data in database views', link: '/data', priority: 'medium', icon: 'Database' },
      { label: 'Check document analytics', description: 'Review document engagement metrics', link: '/documents/analytics', priority: 'medium', icon: 'TrendingUp' },
    ],
    suggestions: [
      { title: 'Build a Dashboard', description: 'Create a live database view to monitor these metrics', link: '/data', buttonLabel: 'Create Database', icon: 'BarChart3' },
      { title: 'Schedule Weekly Report', description: 'Automate this analysis to run every Monday', link: '/copilot/agents', buttonLabel: 'Create Pipeline', icon: 'Zap' },
      { title: 'Share Insights', description: 'Create a page summarizing key findings for the team', link: '/pages/new', buttonLabel: 'Create Page', icon: 'Share2' },
    ],
  },

  planner: {
    summary: 'Project plan finalized — 14 tasks across 3 phases with 4 milestones. Critical path identified.',
    metrics: [
      { label: 'Tasks Created', value: '14', color: '#6366F1' },
      { label: 'Phases', value: '3', color: '#10B981' },
      { label: 'Milestones', value: '4', color: '#F59E0B' },
      { label: 'Duration', value: '6 weeks', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'Open project board', description: 'View and manage tasks in the project tracker', link: '/projects', priority: 'high', icon: 'ClipboardList' },
      { label: 'Create new project', description: 'Set up a new project with this plan', link: '/projects/new', priority: 'high', icon: 'FolderOpen' },
      { label: 'Schedule kickoff', description: 'Book a project kickoff meeting', link: '/calendar/events', priority: 'medium', icon: 'Calendar' },
    ],
    suggestions: [
      { title: 'Assign Team Members', description: 'Manage team assignments in settings', link: '/settings/members', buttonLabel: 'Manage Team', icon: 'Users' },
      { title: 'Set Up Notifications', description: 'Configure alerts for milestone deadlines', link: '/settings/notifications', buttonLabel: 'Configure', icon: 'Bell' },
      { title: 'Track in Calendar', description: 'View milestones in the scheduling calendar', link: '/calendar/schedule', buttonLabel: 'Open Calendar', icon: 'Calendar' },
    ],
  },

  coordinator: {
    summary: 'Team coordination complete — 8 tasks distributed, 2 blockers resolved, velocity above average.',
    metrics: [
      { label: 'Team Members', value: '6', color: '#6366F1' },
      { label: 'Tasks Assigned', value: '8', color: '#10B981' },
      { label: 'Blockers Resolved', value: '2', color: '#F59E0B' },
      { label: 'Velocity', value: '12 pts', trend: 'up', color: '#059669' },
    ],
    actions: [
      { label: 'View project board', description: 'Check task progress and assignments', link: '/projects', priority: 'high', icon: 'ClipboardList' },
      { label: 'Manage team members', description: 'Review team roster and roles', link: '/settings/members', priority: 'medium', icon: 'Users' },
      { label: 'Check bookings', description: 'Review upcoming team meetings', link: '/calendar/bookings', priority: 'medium', icon: 'Calendar' },
    ],
    suggestions: [
      { title: 'Schedule Standup', description: 'Book a recurring standup meeting for the team', link: '/calendar/events', buttonLabel: 'Create Event', icon: 'Calendar' },
      { title: 'View Booking Analytics', description: 'Analyze team meeting patterns and availability', link: '/calendar/analytics', buttonLabel: 'View Analytics', icon: 'BarChart3' },
      { title: 'Send Team Update', description: 'Create a page with the coordination summary', link: '/pages/new', buttonLabel: 'Create Page', icon: 'FileText' },
    ],
  },

  reviewer: {
    summary: 'Review complete — 95% compliance, A-rated code quality. 1 minor issue and 3 optimization suggestions.',
    metrics: [
      { label: 'Compliance', value: '95%', color: '#10B981' },
      { label: 'Quality Rating', value: 'A', color: '#059669' },
      { label: 'Issues Found', value: '1', color: '#F59E0B' },
      { label: 'Suggestions', value: '3', color: '#6366F1' },
    ],
    actions: [
      { label: 'View documents', description: 'Open the reviewed documents for corrections', link: '/documents', priority: 'high', icon: 'FileText' },
      { label: 'Check project tasks', description: 'Update project tasks with review feedback', link: '/projects', priority: 'medium', icon: 'ClipboardList' },
      { label: 'Save review standards', description: 'Store review criteria in Copilot memory', link: '/copilot/memory', priority: 'low', icon: 'Brain' },
    ],
    suggestions: [
      { title: 'Run Security Audit', description: 'Follow up with a security-focused review', link: '/copilot/agents', buttonLabel: 'Start Audit', icon: 'Shield' },
      { title: 'Track in Analytics', description: 'Monitor quality metrics over time', link: '/documents/analytics', buttonLabel: 'View Trends', icon: 'TrendingUp' },
      { title: 'Create Checklist', description: 'Build a reusable review checklist page', link: '/pages/new', buttonLabel: 'Create Page', icon: 'CheckSquare' },
    ],
  },

  sales: {
    summary: 'Sales pipeline report complete — 24 leads qualified, $420K weighted pipeline with 68% win probability.',
    metrics: [
      { label: 'Leads Qualified', value: '24', color: '#10B981' },
      { label: 'Hot Leads', value: '8', trend: 'up', color: '#EF4444' },
      { label: 'Pipeline Value', value: '$420K', color: '#6366F1' },
      { label: 'Win Rate', value: '68%', trend: 'up', color: '#059669' },
    ],
    actions: [
      { label: 'Manage contacts', description: 'View and update lead profiles', link: '/accounting/contacts', priority: 'high', icon: 'Users' },
      { label: 'Create invoices', description: 'Generate invoices for closed deals', link: '/accounting/invoices', priority: 'high', icon: 'DollarSign' },
      { label: 'Schedule demos', description: 'Book demo meetings with hot leads', link: '/calendar/events', priority: 'medium', icon: 'Calendar' },
    ],
    suggestions: [
      { title: 'Set Up Outreach Sequence', description: 'Create an automated email pipeline for warm leads', link: '/copilot/agents', buttonLabel: 'Create Pipeline', icon: 'Zap' },
      { title: 'Track Revenue', description: 'View revenue dashboards in accounting', link: '/accounting/dashboard', buttonLabel: 'View Dashboard', icon: 'BarChart3' },
      { title: 'Create Proposal Template', description: 'Build a reusable proposal in the document builder', link: '/documents/builder', buttonLabel: 'Build Template', icon: 'FileText' },
    ],
  },

  marketing: {
    summary: 'Campaign ready for launch — 4 channels, 3 audience segments, 8 ad variants. Projected 3.2x ROI.',
    metrics: [
      { label: 'Channels', value: '4', color: '#EC4899' },
      { label: 'Ad Variants', value: '8', color: '#8B5CF6' },
      { label: 'Projected ROI', value: '3.2x', trend: 'up', color: '#10B981' },
      { label: 'Timeline', value: '6 weeks', color: '#F59E0B' },
    ],
    actions: [
      { label: 'View booking analytics', description: 'Track campaign-driven bookings', link: '/calendar/analytics', priority: 'high', icon: 'BarChart3' },
      { label: 'Create landing pages', description: 'Build campaign landing pages', link: '/pages/new', priority: 'high', icon: 'FileText' },
      { label: 'Manage contacts', description: 'Update audience segments and contacts', link: '/accounting/contacts', priority: 'medium', icon: 'Users' },
    ],
    suggestions: [
      { title: 'Run SEO Optimization', description: 'Have the SEO Agent optimize landing pages', link: '/copilot/agents', buttonLabel: 'Start SEO', icon: 'Globe' },
      { title: 'Schedule Social Posts', description: 'Plan social media posts with the Social Media Agent', link: '/copilot/agents', buttonLabel: 'Start Social', icon: 'Share2' },
      { title: 'Track Expenses', description: 'Log campaign spend in accounting', link: '/accounting/expenses', buttonLabel: 'Add Expenses', icon: 'DollarSign' },
    ],
  },

  finance: {
    summary: 'Financial report complete — $2.4M Q4 revenue, 12% margin, SaaS subscription grew 18% QoQ.',
    metrics: [
      { label: 'Revenue', value: '$2.4M', color: '#10B981' },
      { label: 'Margin', value: '12%', color: '#F59E0B' },
      { label: 'SaaS Growth', value: '+18%', trend: 'up', color: '#059669' },
      { label: 'Variance', value: '-3.2%', trend: 'down', color: '#EF4444' },
    ],
    actions: [
      { label: 'View accounting dashboard', description: 'See full financial overview and charts', link: '/accounting/dashboard', priority: 'high', icon: 'BarChart3' },
      { label: 'Review expenses', description: 'Drill into expense categories', link: '/accounting/expenses', priority: 'high', icon: 'DollarSign' },
      { label: 'Generate reports', description: 'Create detailed financial reports', link: '/accounting/reports', priority: 'medium', icon: 'FileText' },
    ],
    suggestions: [
      { title: 'File Tax Returns', description: 'Prepare and file quarterly tax returns', link: '/tax/filing', buttonLabel: 'Start Filing', icon: 'FileText' },
      { title: 'Review Tax Documents', description: 'Check tax documents for the quarter', link: '/tax/documents', buttonLabel: 'View Docs', icon: 'FolderOpen' },
      { title: 'Check Banking', description: 'Reconcile bank transactions with expenses', link: '/accounting/banking', buttonLabel: 'Open Banking', icon: 'DollarSign' },
    ],
  },

  legal: {
    summary: 'Legal review complete — 156 clauses analyzed, 4 high-risk items identified requiring negotiation.',
    metrics: [
      { label: 'Clauses Analyzed', value: '156', color: '#6366F1' },
      { label: 'High Risk', value: '4', trend: 'down', color: '#EF4444' },
      { label: 'Compliance Items', value: '2', color: '#F59E0B' },
      { label: 'Contract Pages', value: '42', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'Open document builder', description: 'Edit and redline the contract', link: '/documents/builder', priority: 'high', icon: 'FileText' },
      { label: 'View all documents', description: 'Access the full document library', link: '/documents', priority: 'medium', icon: 'FolderOpen' },
      { label: 'Save legal standards', description: 'Store review criteria for future contracts', link: '/copilot/memory', priority: 'low', icon: 'Brain' },
    ],
    suggestions: [
      { title: 'Run Compliance Check', description: 'Have the Compliance Agent verify regulatory adherence', link: '/copilot/agents', buttonLabel: 'Start Check', icon: 'ShieldCheck' },
      { title: 'Send for Signing', description: 'Route the finalized contract for digital signatures', link: '/documents', buttonLabel: 'Send Document', icon: 'PenTool' },
      { title: 'Schedule Negotiation', description: 'Book a call to discuss high-risk clauses', link: '/calendar/events', buttonLabel: 'Schedule Call', icon: 'Calendar' },
    ],
  },

  compliance: {
    summary: 'Compliance audit complete — 91% adherent across 8 regulations, 2 violations requiring immediate action.',
    metrics: [
      { label: 'Regulations', value: '8', color: '#6366F1' },
      { label: 'Compliance Rate', value: '91%', color: '#10B981' },
      { label: 'Gaps Found', value: '3', color: '#F59E0B' },
      { label: 'Violations', value: '2', trend: 'down', color: '#EF4444' },
    ],
    actions: [
      { label: 'Update security settings', description: 'Address access control and policy gaps', link: '/settings/general', priority: 'high', icon: 'Shield' },
      { label: 'Review documents', description: 'Update data retention policies and procedures', link: '/documents', priority: 'high', icon: 'FileText' },
      { label: 'Check integrations', description: 'Verify third-party integration compliance', link: '/settings/integrations', priority: 'medium', icon: 'Globe' },
    ],
    suggestions: [
      { title: 'Run Security Scan', description: 'Follow up with a full security assessment', link: '/copilot/agents', buttonLabel: 'Start Scan', icon: 'Shield' },
      { title: 'Create Audit Trail', description: 'Set up document tracking and audit logs', link: '/documents/analytics', buttonLabel: 'View Analytics', icon: 'BarChart3' },
      { title: 'Schedule Review', description: 'Book a compliance review meeting', link: '/calendar/events', buttonLabel: 'Schedule', icon: 'Calendar' },
    ],
  },

  hr: {
    summary: 'Hiring package complete — job description, screening criteria, and 30/60/90 onboarding plan ready.',
    metrics: [
      { label: 'Competencies', value: '5', color: '#6366F1' },
      { label: 'Must-Haves', value: '8', color: '#10B981' },
      { label: 'Onboarding Days', value: '90', color: '#F59E0B' },
      { label: 'Survey Items', value: '15', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'Manage team members', description: 'Add new hires and update team roster', link: '/settings/members', priority: 'high', icon: 'Users' },
      { label: 'Create event types', description: 'Set up interview scheduling links', link: '/calendar/events', priority: 'high', icon: 'Calendar' },
      { label: 'Build onboarding page', description: 'Create an onboarding wiki for new hires', link: '/pages/new', priority: 'medium', icon: 'BookOpen' },
    ],
    suggestions: [
      { title: 'Track Payroll', description: 'Set up payroll for the new hire', link: '/accounting/payroll', buttonLabel: 'Open Payroll', icon: 'DollarSign' },
      { title: 'Create Checklist DB', description: 'Build an onboarding checklist database', link: '/data', buttonLabel: 'Create Database', icon: 'Database' },
      { title: 'Store HR Policies', description: 'Save hiring standards in Copilot memory', link: '/copilot/memory', buttonLabel: 'Save to Memory', icon: 'Brain' },
    ],
  },

  customerSuccess: {
    summary: 'Customer success report complete — 47 tickets triaged, NPS 42 (+3 MoM), 3 accounts need immediate intervention.',
    metrics: [
      { label: 'Tickets Triaged', value: '47', color: '#6366F1' },
      { label: 'Urgent Resolved', value: '8/12', color: '#F59E0B' },
      { label: 'NPS Score', value: '42', trend: 'up', color: '#10B981' },
      { label: 'At-Risk Accounts', value: '8', trend: 'down', color: '#EF4444' },
    ],
    actions: [
      { label: 'Schedule check-in calls', description: 'Book calls with 3 high-churn-risk accounts', link: '/calendar/events', priority: 'high', icon: 'Calendar' },
      { label: 'Escalate billing issues', description: 'Review 5 billing tickets in accounting', link: '/accounting/invoices', priority: 'high', icon: 'DollarSign' },
      { label: 'Update knowledge base', description: 'Add top 10 FAQ answers to workspace', link: '/pages/new', priority: 'medium', icon: 'BookOpen' },
    ],
    suggestions: [
      { title: 'View Contact Profiles', description: 'Review at-risk account details and history', link: '/accounting/contacts', buttonLabel: 'View Contacts', icon: 'Users' },
      { title: 'Analyze Booking Patterns', description: 'Check meeting frequency with at-risk accounts', link: '/calendar/analytics', buttonLabel: 'View Analytics', icon: 'BarChart3' },
      { title: 'Create NPS Database', description: 'Track NPS scores over time in a database', link: '/data', buttonLabel: 'Create Database', icon: 'Database' },
    ],
  },

  translation: {
    summary: 'Translation complete — 2,400 words translated, 14 idioms localized, quality score 96/100.',
    metrics: [
      { label: 'Words', value: '2,400', color: '#6366F1' },
      { label: 'Idioms Localized', value: '14', color: '#10B981' },
      { label: 'Quality Score', value: '96/100', color: '#059669' },
      { label: 'Flagged Items', value: '2', color: '#F59E0B' },
    ],
    actions: [
      { label: 'Review in documents', description: 'Open translated documents for final review', link: '/documents', priority: 'high', icon: 'FileText' },
      { label: 'Edit in workspace', description: 'Fine-tune translations in workspace pages', link: '/pages', priority: 'medium', icon: 'BookOpen' },
      { label: 'Save glossary', description: 'Store translation glossary in Copilot memory', link: '/copilot/memory', priority: 'low', icon: 'Brain' },
    ],
    suggestions: [
      { title: 'Run Quality Review', description: 'Have the Reviewer Agent check the translation', link: '/copilot/agents', buttonLabel: 'Start Review', icon: 'CheckSquare' },
      { title: 'Build Glossary Database', description: 'Create a searchable terminology database', link: '/data', buttonLabel: 'Create Database', icon: 'Database' },
      { title: 'Send for Signing', description: 'Route translated contracts for signatures', link: '/documents', buttonLabel: 'Send Document', icon: 'PenTool' },
    ],
  },

  seo: {
    summary: 'SEO optimization complete — 15 high-value keywords targeted, 8 pages optimized. Projected +25-35% organic traffic.',
    metrics: [
      { label: 'Keywords', value: '15', color: '#10B981' },
      { label: 'Pages Optimized', value: '8', color: '#6366F1' },
      { label: 'Competitors', value: '5', color: '#F59E0B' },
      { label: 'Traffic Projection', value: '+30%', trend: 'up', color: '#059669' },
    ],
    actions: [
      { label: 'Edit optimized pages', description: 'Update workspace pages with SEO improvements', link: '/pages', priority: 'high', icon: 'FileText' },
      { label: 'Track analytics', description: 'Monitor document and page engagement', link: '/documents/analytics', priority: 'high', icon: 'BarChart3' },
      { label: 'Save keyword data', description: 'Store keyword research in Copilot memory', link: '/copilot/memory', priority: 'medium', icon: 'Brain' },
    ],
    suggestions: [
      { title: 'Create Content Pipeline', description: 'Automate content creation for gap keywords', link: '/copilot/agents', buttonLabel: 'Create Pipeline', icon: 'Zap' },
      { title: 'Build Keyword Tracker', description: 'Create a database to track keyword rankings', link: '/data', buttonLabel: 'Create Database', icon: 'Database' },
      { title: 'Plan Content Calendar', description: 'Schedule content publication in the calendar', link: '/calendar/events', buttonLabel: 'Create Events', icon: 'Calendar' },
    ],
  },

  socialMedia: {
    summary: 'Social media plan complete — 30 posts across 4 weeks, 3 platforms. Projected +12% engagement increase.',
    metrics: [
      { label: 'Posts Created', value: '30', color: '#EC4899' },
      { label: 'Platforms', value: '3', color: '#6366F1' },
      { label: 'Hashtag Sets', value: '5', color: '#8B5CF6' },
      { label: 'Engagement', value: '+12%', trend: 'up', color: '#10B981' },
    ],
    actions: [
      { label: 'Create content pages', description: 'Build post drafts in workspace pages', link: '/pages/new', priority: 'high', icon: 'FileText' },
      { label: 'Schedule posts', description: 'Set up posting schedule in the calendar', link: '/calendar/events', priority: 'high', icon: 'Calendar' },
      { label: 'Track performance', description: 'Monitor engagement in analytics', link: '/calendar/analytics', priority: 'medium', icon: 'BarChart3' },
    ],
    suggestions: [
      { title: 'Run SEO Check', description: 'Optimize social content for search visibility', link: '/copilot/agents', buttonLabel: 'Start SEO', icon: 'Globe' },
      { title: 'Build Analytics DB', description: 'Track post performance in a database', link: '/data', buttonLabel: 'Create Database', icon: 'Database' },
      { title: 'Create Brand Guide', description: 'Save brand voice and style to Copilot memory', link: '/copilot/memory', buttonLabel: 'Save to Memory', icon: 'Brain' },
    ],
  },

  security: {
    summary: 'Security assessment complete — 7 vulnerabilities found (2 critical), overall risk score 7.2/10.',
    metrics: [
      { label: 'Endpoints', value: '24', color: '#6366F1' },
      { label: 'Critical', value: '2', trend: 'down', color: '#EF4444' },
      { label: 'Medium', value: '3', color: '#F59E0B' },
      { label: 'Risk Score', value: '7.2/10', color: '#F59E0B' },
    ],
    actions: [
      { label: 'Review API keys', description: 'Rotate and audit all API keys immediately', link: '/developer/keys', priority: 'high', icon: 'Shield' },
      { label: 'Check webhooks', description: 'Verify webhook endpoint security', link: '/developer/webhooks', priority: 'high', icon: 'Globe' },
      { label: 'Update access controls', description: 'Review team member permissions', link: '/settings/members', priority: 'medium', icon: 'Users' },
    ],
    suggestions: [
      { title: 'Run Compliance Audit', description: 'Follow up with a compliance check (GDPR, SOC2)', link: '/copilot/agents', buttonLabel: 'Start Audit', icon: 'ShieldCheck' },
      { title: 'Configure Notifications', description: 'Set up alerts for security events', link: '/settings/notifications', buttonLabel: 'Configure', icon: 'Bell' },
      { title: 'Document Findings', description: 'Create a security report in workspace', link: '/pages/new', buttonLabel: 'Create Report', icon: 'FileText' },
    ],
  },

  devops: {
    summary: 'DevOps setup complete — CI/CD pipeline configured, 24 metrics monitored, zero-downtime deployment validated.',
    metrics: [
      { label: 'Services', value: '8', color: '#6366F1' },
      { label: 'Metrics', value: '24', color: '#10B981' },
      { label: 'Alerts', value: '8', color: '#F59E0B' },
      { label: 'Deploy Time', value: '4 min', color: '#8B5CF6' },
    ],
    actions: [
      { label: 'View API docs', description: 'Check API health and documentation', link: '/developer/api', priority: 'high', icon: 'BookOpen' },
      { label: 'Configure webhooks', description: 'Set up deployment webhooks and notifications', link: '/developer/webhooks', priority: 'high', icon: 'Globe' },
      { label: 'Manage SDK integrations', description: 'Review SDK configurations', link: '/developer/sdks', priority: 'medium', icon: 'Code2' },
    ],
    suggestions: [
      { title: 'Run Security Scan', description: 'Audit infrastructure for vulnerabilities', link: '/copilot/agents', buttonLabel: 'Start Scan', icon: 'Shield' },
      { title: 'Create Runbooks', description: 'Document incident response procedures', link: '/pages/new', buttonLabel: 'Create Page', icon: 'FileText' },
      { title: 'Set Up Sandbox', description: 'Test deployments in the developer sandbox', link: '/developer/sandbox', buttonLabel: 'Open Sandbox', icon: 'Code2' },
    ],
  },
}

export function getStructuredResult(agentType: string): StructuredRunResult {
  return STRUCTURED_RESULTS[agentType] ?? {
    summary: 'Run completed successfully. All steps executed without errors.',
    metrics: [],
    actions: [],
    suggestions: [],
  }
}
