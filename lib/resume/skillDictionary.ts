export type SkillDictionary = Record<string, string[]>;

// Canonical skill name -> aliases/tokens
// Boundary-aware matching will be applied in the parser helper.
export const SKILL_DICTIONARY: SkillDictionary = {
  // Frontend
  "JavaScript": ["JavaScript", "JS"],
  "TypeScript": ["TypeScript", "TS"],
  "React": ["React", "React.js", "ReactJS"],
  "Next.js": ["Next.js", "NextJS", "Next"],
  "Vue": ["Vue", "Vue.js", "VueJS"],
  "Angular": ["Angular"],
  "Svelte": ["Svelte"],
  "CSS": ["CSS", "CSS3"],
  "HTML": ["HTML", "HTML5"],
  "Tailwind": ["Tailwind", "TailwindCSS", "Tailwind CSS"],
  "Redux": ["Redux"],
  "Webpack": ["Webpack"],

  // Backend
  "Node.js": ["Node.js", "NodeJS", "Node"],
  "Express": ["Express", "Express.js"],
  "Python": ["Python"],
  "Django": ["Django"],
  "Flask": ["Flask"],
  "FastAPI": ["FastAPI"],
  "Java": ["Java"],
  "Spring": ["Spring", "Spring Boot", "SpringBoot"],
  "C#": ["C#", "CSharp"],
  ".NET": [".NET", ".NET Core"],
  "Go": ["Go", "Golang"],
  "Rust": ["Rust"],
  "PHP": ["PHP"],
  "Ruby": ["Ruby", "Rails", "Ruby on Rails"],

  // Databases & APIs
  "SQL": ["SQL"],
  "PostgreSQL": ["PostgreSQL", "Postgres"],
  "MySQL": ["MySQL"],
  "MongoDB": ["MongoDB", "Mongo"],
  "GraphQL": ["GraphQL"],
  "Redis": ["Redis"],
  "Kafka": ["Kafka", "Apache Kafka"],
  "RabbitMQ": ["RabbitMQ"],

  // DevOps
  "AWS": ["AWS", "Amazon Web Services"],
  "GCP": ["GCP", "Google Cloud"],
  "Azure": ["Azure", "Microsoft Azure"],
  "Docker": ["Docker"],
  "Kubernetes": ["Kubernetes", "K8s"],
  "Terraform": ["Terraform"],
  "CI/CD": ["CI/CD", "CI-CD", "Continuous Integration", "Continuous Delivery"],
  "Jenkins": ["Jenkins"],
  "GitHub Actions": ["GitHub Actions", "Actions"],

  // Data/ML
  "Pandas": ["Pandas"],
  "NumPy": ["NumPy", "Numpy"],
  "Scikit-Learn": ["Scikit-Learn", "sklearn"],
  "TensorFlow": ["TensorFlow", "TF"],
  "PyTorch": ["PyTorch"],
  "Spark": ["Spark", "Apache Spark"],
  "Hadoop": ["Hadoop"],
  "Airflow": ["Airflow"],
  "SQL Server": ["SQL Server", "MSSQL"],
};
