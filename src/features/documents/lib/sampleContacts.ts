import type { Contact } from '../../../types'

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Jane Smith',
    email: 'jane.smith@acme.com',
    company: 'Acme Corp',
    phone: '+1 (555) 123-4567',
    signingHistory: [
      { documentId: '1', date: '2026-02-02T14:00:00Z', status: 'signed' },
    ],
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'c2',
    name: 'Bob Johnson',
    email: 'bob.johnson@globex.com',
    company: 'Globex Industries',
    phone: '+1 (555) 234-5678',
    signingHistory: [
      { documentId: '2', date: '2026-01-21T11:00:00Z', status: 'signed' },
      { documentId: '5', date: '2026-01-15T09:30:00Z', status: 'signed' },
    ],
    createdAt: '2026-01-05T12:00:00Z',
  },
  {
    id: 'c3',
    name: 'Alice Williams',
    email: 'alice@startupxyz.io',
    company: 'StartupXYZ',
    signingHistory: [],
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'c4',
    name: 'David Chen',
    email: 'david.chen@techflow.dev',
    company: 'TechFlow',
    phone: '+1 (555) 345-6789',
    signingHistory: [
      { documentId: '3', date: '2026-02-05T16:00:00Z', status: 'declined' },
    ],
    createdAt: '2026-01-12T14:30:00Z',
  },
  {
    id: 'c5',
    name: 'Sarah Martinez',
    email: 'sarah.m@legalpartners.com',
    company: 'Legal Partners LLP',
    phone: '+1 (555) 456-7890',
    signingHistory: [
      { documentId: '4', date: '2026-01-30T10:00:00Z', status: 'signed' },
      { documentId: '6', date: '2026-02-01T08:00:00Z', status: 'signed' },
      { documentId: '7', date: '2026-02-03T14:00:00Z', status: 'signed' },
    ],
    createdAt: '2026-01-02T09:00:00Z',
  },
  {
    id: 'c6',
    name: 'Michael Brown',
    email: 'michael.b@consulting.co',
    signingHistory: [],
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'c7',
    name: 'Emily Davis',
    email: 'emily.davis@designstudio.com',
    company: 'Design Studio',
    phone: '+1 (555) 567-8901',
    signingHistory: [
      { documentId: '8', date: '2026-01-25T13:00:00Z', status: 'signed' },
    ],
    createdAt: '2026-01-08T16:00:00Z',
  },
  {
    id: 'c8',
    name: 'James Wilson',
    email: 'jwilson@enterprise.org',
    company: 'Enterprise Solutions',
    phone: '+1 (555) 678-9012',
    signingHistory: [
      { documentId: '9', date: '2026-02-06T09:00:00Z', status: 'signed' },
      { documentId: '10', date: '2026-02-07T11:00:00Z', status: 'signed' },
    ],
    createdAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'c9',
    name: 'Lisa Anderson',
    email: 'lisa.a@freelance.me',
    signingHistory: [],
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'c10',
    name: 'Robert Taylor',
    email: 'r.taylor@finance.com',
    company: 'Finance Group',
    phone: '+1 (555) 789-0123',
    signingHistory: [
      { documentId: '11', date: '2026-01-28T15:00:00Z', status: 'signed' },
    ],
    createdAt: '2026-01-03T07:30:00Z',
  },
]
