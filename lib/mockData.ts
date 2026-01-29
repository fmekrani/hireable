// Mock data and types
export interface Job {
  id: string
  title: string
  company: string
  url: string
  dateAdded: string
}

export interface JobResult {
  skills: string[]
  resources: { skill: string; links: string[] }[]
  timeline: { skill: string; weeks: number }[]
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'TechCorp',
    url: 'https://example.com/job1',
    dateAdded: '2024-01-15',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    url: 'https://example.com/job2',
    dateAdded: '2024-01-10',
  },
  {
    id: '3',
    title: 'Frontend Specialist',
    company: 'DesignStudio',
    url: 'https://example.com/job3',
    dateAdded: '2024-01-05',
  },
  {
    id: '4',
    title: 'TypeScript Developer',
    company: 'CloudServices',
    url: 'https://example.com/job4',
    dateAdded: '2024-01-01',
  },
]

export const mockResults: Record<string, JobResult> = {
  '1': {
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'System Design'],
    resources: [
      { skill: 'React', links: ['React Docs', 'Advanced Patterns Course'] },
      { skill: 'TypeScript', links: ['TypeScript Handbook', 'Type System Deep Dive'] },
      { skill: 'Node.js', links: ['Node.js Official Guide', 'Backend Development'] },
      { skill: 'GraphQL', links: ['GraphQL Basics', 'Apollo Server Tutorial'] },
      { skill: 'System Design', links: ['System Design Primer', 'Distributed Systems'] },
    ],
    timeline: [
      { skill: 'React', weeks: 2 },
      { skill: 'TypeScript', weeks: 2 },
      { skill: 'Node.js', weeks: 3 },
      { skill: 'GraphQL', weeks: 2 },
      { skill: 'System Design', weeks: 4 },
    ],
  },
  '2': {
    skills: ['JavaScript', 'Python', 'PostgreSQL', 'AWS', 'Docker'],
    resources: [
      { skill: 'JavaScript', links: ['JavaScript.info', 'Eloquent JS'] },
      { skill: 'Python', links: ['Python Official', 'Real Python'] },
      { skill: 'PostgreSQL', links: ['PostgreSQL Docs', 'SQL Tutorial'] },
      { skill: 'AWS', links: ['AWS Certification', 'AWS Free Tier'] },
      { skill: 'Docker', links: ['Docker Docs', 'Container Basics'] },
    ],
    timeline: [
      { skill: 'JavaScript', weeks: 2 },
      { skill: 'Python', weeks: 3 },
      { skill: 'PostgreSQL', weeks: 2 },
      { skill: 'AWS', weeks: 3 },
      { skill: 'Docker', weeks: 2 },
    ],
  },
}
