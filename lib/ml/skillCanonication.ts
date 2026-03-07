/**
 * Skill Canonicalization and Taxonomy System
 *
 * Provides deterministic, data-driven skill matching with:
 * - Exact canonical mapping for tools and skills
 * - Acronym expansion and abbreviation handling
 * - Category taxonomy with member skills
 * - Soft skills identification
 * - Role-aware matching
 *
 * Used by:
 * - Resume skill extraction
 * - Job requirement extraction
 * - Resume-to-job matching
 * - Scoring engine
 */

// ===== CANONICAL SKILL DATABASE =====

const SKILL_ALIASES: Record<string, string> = {
  // Business Intelligence & Analytics
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'pbi': 'Power BI',
  'bi': 'Business Intelligence',
  'business intelligence': 'Business Intelligence',
  'tableau': 'Tableau',
  'looker': 'Looker',
  'qlik': 'QlikView',
  'microstrategy': 'MicroStrategy',
  'domo': 'Domo',
  'sisense': 'Sisense',
  'cognos': 'IBM Cognos',
  'splunk': 'Splunk',

  // SQL & Databases
  'sql': 'SQL',
  'structured query language': 'SQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'oracle': 'Oracle Database',
  'sql server': 'SQL Server',
  'mssql': 'SQL Server',
  't-sql': 'SQL Server',
  'tsql': 'SQL Server',
  'mongodb': 'MongoDB',
  'nosql': 'NoSQL',
  'redis': 'Redis',
  'cassandra': 'Cassandra',
  'elasticsearch': 'Elasticsearch',
  'bigquery': 'BigQuery',
  'snowflake': 'Snowflake',
  'redshift': 'Amazon Redshift',
  'dynamodb': 'Amazon DynamoDB',
  'rds': 'AWS RDS',

  // Frontend
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'vue': 'Vue',
  'vuejs': 'Vue',
  'vue.js': 'Vue',
  'angular': 'Angular',
  'angularjs': 'AngularJS',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'nuxtjs': 'Nuxt',
  'nuxt.js': 'Nuxt',
  'svelte': 'Svelte',
  'html': 'HTML',
  'html5': 'HTML5',
  'css': 'CSS',
  'scss': 'SCSS',
  'sass': 'SASS',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'material ui': 'Material UI',
  'materialui': 'Material UI',
  'storybook': 'Storybook',
  'webpack': 'Webpack',
  'vite': 'Vite',
  'parcel': 'Parcel',
  'gulp': 'Gulp',
  'grunt': 'Grunt',
  'rollup': 'Rollup',

  // JavaScript/TypeScript
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'ecmascript': 'JavaScript',
  'es6': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'npm': 'npm',
  'yarn': 'Yarn',
  'pnpm': 'pnpm',
  'bun': 'Bun',

  // Backend Frameworks
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'nestjs': 'NestJS',
  'nest.js': 'NestJS',
  'fastify': 'Fastify',
  'hapi': 'hapi.js',
  'koa': 'Koa',
  'loopback': 'LoopBack',
  'sails': 'Sails.js',
  'apollo': 'Apollo Server',
  'graphql': 'GraphQL',
  'rest': 'REST',
  'restful': 'REST',

  // Python & Data
  'python': 'Python',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'pyramid': 'Pyramid',
  'tornado': 'Tornado',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scipy': 'SciPy',
  'scikit-learn': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'matplotlib': 'Matplotlib',
  'seaborn': 'Seaborn',
  'plotly': 'Plotly',
  'jupyter': 'Jupyter',
  'ipython': 'IPython',

  // Machine Learning & AI
  'tensorflow': 'TensorFlow',
  'keras': 'Keras',
  'pytorch': 'PyTorch',
  'torch': 'PyTorch',
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'neural network': 'Neural Networks',
  'nlp': 'Natural Language Processing',
  'natural language processing': 'Natural Language Processing',
  'cv': 'Computer Vision',
  'computer vision': 'Computer Vision',
  'openai': 'OpenAI',
  'gpt': 'GPT',
  'llm': 'Large Language Models',
  'hugging face': 'Hugging Face',
  'huggingface': 'Hugging Face',

  // DevOps & Cloud
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'helm': 'Helm',
  'terraform': 'Terraform',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'ec2': 'AWS EC2',
  's3': 'AWS S3',
  'lambda': 'AWS Lambda',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'gke': 'Google Kubernetes Engine',
  'dataflow': 'Google Dataflow',
  'azure': 'Azure',
  'azure devops': 'Azure DevOps',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'jenkins': 'Jenkins',
  'github actions': 'GitHub Actions',
  'circleci': 'CircleCI',
  'travis': 'Travis CI',
  'travisci': 'Travis CI',
  'ansible': 'Ansible',
  'puppet': 'Puppet',
  'chef': 'Chef',
  'prometheus': 'Prometheus',
  'grafana': 'Grafana',
  'datadog': 'Datadog',
  'newrelic': 'New Relic',
  'new relic': 'New Relic',
  'elk': 'ELK Stack',
  'logstash': 'Logstash',
  'kibana': 'Kibana',

  // Data Engineering
  'spark': 'Apache Spark',
  'apache spark': 'Apache Spark',
  'hadoop': 'Hadoop',
  'hive': 'Apache Hive',
  'airflow': 'Apache Airflow',
  'dbt': 'dbt',
  'fivetran': 'Fivetran',
  'talend': 'Talend',
  'informatica': 'Informatica',
  'etl': 'ETL',
  'datawarehouse': 'Data Warehouse',
  'data warehouse': 'Data Warehouse',
  'datamart': 'Data Mart',
  'data mart': 'Data Mart',

  // Languages
  'java': 'Java',
  'scala': 'Scala',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  '.net': '.NET',
  'dotnet': '.NET',
  'c': 'C',
  'objective-c': 'Objective-C',
  'objc': 'Objective-C',
  'php': 'PHP',
  'laravel': 'Laravel',
  'symfony': 'Symfony',
  'ruby': 'Ruby',
  'rails': 'Ruby on Rails',
  'ruby on rails': 'Ruby on Rails',
  'r': 'R',
  'sas': 'SAS',
  'matlab': 'MATLAB',
  'perl': 'Perl',
  'shell': 'Shell Script',
  'bash': 'Bash',
  'zsh': 'Zsh',
  'swift': 'Swift',
  'dart': 'Dart',
  'kotlin': 'Kotlin',

  // Mobile
  'react native': 'React Native',
  'reactnative': 'React Native',
  'flutter': 'Flutter',
  'android': 'Android',
  'ios': 'iOS',

  // Version Control
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',
  'svn': 'Subversion',
  'subversion': 'Subversion',

  // Testing
  'jest': 'Jest',
  'mocha': 'Mocha',
  'jasmine': 'Jasmine',
  'vitest': 'Vitest',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'pytest': 'Pytest',
  'unittest': 'unittest',
  'rspec': 'RSpec',
  'junit': 'JUnit',
  'testng': 'TestNG',
  'cucumber': 'Cucumber',
  'jmeter': 'JMeter',

  // Soft Skills (treated specially)
  'communication': 'Communication',
  'teamwork': 'Teamwork',
  'collaboration': 'Collaboration',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'leadership': 'Leadership',
  'problem solving': 'Problem Solving',
  'problemsolving': 'Problem Solving',
  'critical thinking': 'Critical Thinking',
  'analytics skills': 'Analytical Skills',
  'analytical skills': 'Analytical Skills',
  'time management': 'Time Management',
  'timemanagement': 'Time Management',
  'project management': 'Project Management',
  'projectmanagement': 'Project Management',
  'presentation': 'Presentation',
  'documentation': 'Documentation',
};

// ===== SKILL CATEGORIES & TAXONOMY =====

export interface SkillCategory {
  name: string;
  aliases: string[];
  memberSkills: string[];
  roleRelevance: Record<string, number>;
}

export const SKILL_CATEGORIES: Record<string, SkillCategory> = {
  BUSINESS_INTELLIGENCE: {
    name: 'Business Intelligence',
    aliases: ['bi', 'analytics', 'data analytics', 'business analytics'],
    memberSkills: ['Power BI', 'Tableau', 'Looker', 'QlikView', 'MicroStrategy', 'Domo', 'Sisense', 'IBM Cognos'],
    roleRelevance: {
      data_analyst: 1.0,
      bi_engineer: 1.0,
      analytics_engineer: 0.8,
      backend: 0.3,
      frontend: 0.1,
    },
  },
  DATABASES: {
    name: 'Databases',
    aliases: ['db', 'database', 'data storage'],
    memberSkills: ['SQL', 'PostgreSQL', 'MySQL', 'Oracle Database', 'SQL Server', 'MongoDB', 'Redis', 'Cassandra', 'Amazon DynamoDB'],
    roleRelevance: {
      backend: 0.95,
      data_engineer: 0.9,
      full_stack: 0.85,
      frontend: 0.3,
      data_analyst: 0.8,
    },
  },
  FRONTEND: {
    name: 'Frontend',
    aliases: ['ui', 'ux', 'web frontend', 'client-side'],
    memberSkills: ['React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap'],
    roleRelevance: {
      frontend: 1.0,
      full_stack: 0.9,
      backend: 0.1,
      mobile: 0.5,
    },
  },
  BACKEND: {
    name: 'Backend',
    aliases: ['server', 'server-side', 'api'],
    memberSkills: ['Node.js', 'Express.js', 'Django', 'Flask', 'Java', 'Go', 'Rust', 'Python', 'C#', '.NET'],
    roleRelevance: {
      backend: 1.0,
      full_stack: 0.9,
      frontend: 0.1,
      data_engineer: 0.4,
    },
  },
  CLOUD_INFRASTRUCTURE: {
    name: 'Cloud Infrastructure',
    aliases: ['cloud', 'cloud provider', 'iaas'],
    memberSkills: ['AWS', 'Google Cloud', 'Azure', 'AWS EC2', 'AWS S3', 'AWS Lambda', 'Google Kubernetes Engine'],
    roleRelevance: {
      devops: 1.0,
      backend: 0.8,
      full_stack: 0.6,
      data_engineer: 0.7,
    },
  },
  CONTAINERIZATION: {
    name: 'Containerization',
    aliases: ['containers', 'container tech'],
    memberSkills: ['Docker', 'Kubernetes', 'Helm'],
    roleRelevance: {
      devops: 1.0,
      backend: 0.8,
      full_stack: 0.6,
      data_engineer: 0.7,
    },
  },
  CICD: {
    name: 'CI/CD',
    aliases: ['continuous integration', 'continuous deployment', 'pipeline'],
    memberSkills: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI'],
    roleRelevance: {
      devops: 1.0,
      backend: 0.8,
      full_stack: 0.6,
    },
  },
  MACHINE_LEARNING: {
    name: 'Machine Learning',
    aliases: ['ml', 'ai', 'artificial intelligence', 'deep learning'],
    memberSkills: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Neural Networks', 'Natural Language Processing', 'Computer Vision'],
    roleRelevance: {
      ml_engineer: 1.0,
      data_scientist: 0.95,
      data_engineer: 0.5,
      backend: 0.3,
    },
  },
  DATA_ENGINEERING: {
    name: 'Data Engineering',
    aliases: ['data pipeline', 'etl', 'data processing'],
    memberSkills: ['Apache Spark', 'Hadoop', 'Apache Airflow', 'dbt', 'ETL', 'Data Warehouse'],
    roleRelevance: {
      data_engineer: 1.0,
      data_analyst: 0.6,
      data_scientist: 0.5,
      backend: 0.3,
    },
  },
  VERSION_CONTROL: {
    name: 'Version Control',
    aliases: ['git', 'social coding', 'scm'],
    memberSkills: ['Git', 'GitHub', 'GitLab', 'Bitbucket'],
    roleRelevance: {
      backend: 0.95,
      frontend: 0.95,
      full_stack: 0.95,
      devops: 0.9,
    },
  },
  TESTING: {
    name: 'Testing',
    aliases: ['qa', 'quality assurance', 'test automation'],
    memberSkills: ['Jest', 'Mocha', 'Pytest', 'Selenium', 'Cypress', 'JUnit'],
    roleRelevance: {
      qa: 1.0,
      backend: 0.8,
      frontend: 0.8,
      full_stack: 0.7,
    },
  },
};

// ===== SOFT SKILLS IDENTIFICATION =====

const SOFT_SKILLS_SET = new Set([
  'Communication',
  'Teamwork',
  'Collaboration',
  'Agile',
  'Scrum',
  'Kanban',
  'Jira',
  'Confluence',
  'Leadership',
  'Problem Solving',
  'Critical Thinking',
  'Analytical Skills',
  'Time Management',
  'Project Management',
  'Presentation',
  'Documentation',
  'Mentoring',
  'Training',
  'Customer Service',
  'Interpersonal',
  'Adaptability',
  'Flexibility',
  'Reliability',
  'Attention to Detail',
  'Organizational Skills',
]);

// ===== PUBLIC API =====

/**
 * Canonicalize a skill name to its canonical form
 */
export function canonicalizeSkill(skill: string): string {
  if (!skill) return '';
  const normalized = skill.trim().toLowerCase();
  return SKILL_ALIASES[normalized] || skill.trim();
}

/**
 * Check if a skill is considered a soft skill
 */
export function isSoftSkill(skill: string): boolean {
  const canonical = canonicalizeSkill(skill);
  return SOFT_SKILLS_SET.has(canonical);
}

/**
 * Get the category that a skill belongs to
 */
export function getSkillCategory(skill: string): SkillCategory | null {
  const canonical = canonicalizeSkill(skill);
  for (const category of Object.values(SKILL_CATEGORIES)) {
    if (category.memberSkills.includes(canonical)) {
      return category;
    }
  }
  return null;
}

/**
 * Match two skills considering synonyms and category relationships
 */
export function matchSkills(resumeSkill: string, jobSkill: string): 'exact' | 'near' | 'none' {
  const resumeCanonical = canonicalizeSkill(resumeSkill);
  const jobCanonical = canonicalizeSkill(jobSkill);

  if (resumeCanonical === jobCanonical) {
    return 'exact';
  }

  const resumeCategory = getSkillCategory(resumeCanonical);
  const jobCategory = getSkillCategory(jobCanonical);

  if (resumeCategory && jobCategory && resumeCategory.name === jobCategory.name) {
    return 'near';
  }

  return 'none';
}

/**
 * Assess skill match with confidence score
 */
export function assessSkillMatch(resumeSkill: string, jobSkill: string): {
  type: 'exact' | 'near' | 'none';
  confidence: number;
} {
  const match = matchSkills(resumeSkill, jobSkill);

  if (match === 'exact') {
    return { type: 'exact', confidence: 1.0 };
  }

  if (match === 'near') {
    return { type: 'near', confidence: 0.6 };
  }

  return { type: 'none', confidence: 0 };
}

/**
 * Infer role family from job title and skills
 */
export function inferRoleFamily(jobTitle: string, requiredSkills: string[]): string {
  const titleLower = jobTitle.toLowerCase();
  const skillCategoryCounts: Record<string, number> = {};

  requiredSkills.forEach((skill) => {
    const category = getSkillCategory(skill);
    if (category) {
      skillCategoryCounts[category.name] = (skillCategoryCounts[category.name] || 0) + 1;
    }
  });

  // Check title keywords first
  if (titleLower.includes('backend') || titleLower.includes('back-end')) return 'backend';
  if (titleLower.includes('frontend') || titleLower.includes('front-end') || titleLower.includes('ui') || titleLower.includes('ux')) return 'frontend';
  if (titleLower.includes('full stack') || titleLower.includes('fullstack')) return 'full_stack';
  if (titleLower.includes('devops') || titleLower.includes('sre')) return 'devops';
  if (titleLower.includes('data engineer')) return 'data_engineer';
  if (titleLower.includes('data analyst') || titleLower.includes('bi ')) return 'data_analyst';
  if (titleLower.includes('data scientist')) return 'data_scientist';
  if (titleLower.includes('ml ') || titleLower.includes('machine learning')) return 'ml_engineer';
  if (titleLower.includes('qa') || titleLower.includes('quality assurance')) return 'qa';
  if (titleLower.includes('security')) return 'security';

  // Infer from skills
  const MAX_CATEGORY_COUNT = Math.max(...Object.values(skillCategoryCounts), 0);

  if (requiredSkills.length > 0) {
    if (skillCategoryCounts['Backend'] === MAX_CATEGORY_COUNT && MAX_CATEGORY_COUNT > 0) return 'backend';
    if (skillCategoryCounts['Frontend'] === MAX_CATEGORY_COUNT && MAX_CATEGORY_COUNT > 0) return 'frontend';
    if (skillCategoryCounts['Data Engineering'] === MAX_CATEGORY_COUNT && MAX_CATEGORY_COUNT > 0) return 'data_engineer';
    if (skillCategoryCounts['Business Intelligence'] === MAX_CATEGORY_COUNT && MAX_CATEGORY_COUNT > 0) return 'data_analyst';
    if (skillCategoryCounts['Machine Learning'] === MAX_CATEGORY_COUNT && MAX_CATEGORY_COUNT > 0) return 'ml_engineer';
    if ((skillCategoryCounts['Cloud Infrastructure'] === MAX_CATEGORY_COUNT || skillCategoryCounts['Containerization'] === MAX_CATEGORY_COUNT) && MAX_CATEGORY_COUNT > 0) return 'devops';
  }

  return 'general';
}

/**
 * Get core hard skills expected for a role family
 */
export function getCoreSkillsForRole(roleFamily: string): string[] {
  const coreSkills: Record<string, string[]> = {
    backend: ['SQL', 'Git', 'REST'],
    frontend: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    full_stack: ['HTML', 'CSS', 'JavaScript', 'SQL', 'Git'],
    devops: ['Docker', 'Git', 'CI/CD'],
    data_engineer: ['SQL', 'Python', 'Apache Spark', 'Git'],
    data_analyst: ['SQL', 'Business Intelligence', 'Tableau'],
    data_scientist: ['Python', 'SQL', 'Machine Learning'],
    ml_engineer: ['Python', 'Machine Learning', 'TensorFlow'],
    qa: ['Testing', 'Git'],
    security: ['Linux', 'Security'],
  };

  return coreSkills[roleFamily.toLowerCase()] || [];
}
