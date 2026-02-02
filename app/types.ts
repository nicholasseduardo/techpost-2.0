
export enum SocialNetwork {
  LINKEDIN = 'LinkedIn',
  TWITTER = 'Twitter/X',
  INSTAGRAM = 'Instagram',
  FACEBOOK = 'Facebook',
  MEDIUM = 'Medium'
}

export enum TargetAudience {
  ENGINEERS = 'Engenheiros',
  BUSINESSMEN = 'Empresários',
  PROGRAMMERS = 'Programadores',
  STUDENTS = 'Estudantes',
  RECRUITERS = 'Recrutadores',
  LAYMEN = 'Leigos'
}

export enum PostObjective {
  AUTHORITY = 'Autoridade',
  ENGAGEMENT = 'Engajamento',
  EDUCATIONAL = 'Educacional',
  STORYTELLING = 'Storytelling'
}

export enum PostTone {
  PROVOCATIVE = 'Polêmico/Provocador',
  EDUCATIONAL = 'Educacional',
  INSPIRATIONAL = 'Inspirador',
  PROFESSIONAL = 'Profissional',
  REFLECTIVE = 'Reflexivo'
}

export interface GeneratedPost {
  id: string;
  topic: string;
  content: string;
  
  timestamp?: number;
  config?: {
    channel: SocialNetwork;
    audience: TargetAudience;
    objective: PostObjective;
    tone: PostTone;
  };
  
  platform?: string;
  style?: string;
  createdAt?: Date;
}

export interface GenerationParams {
  channel: SocialNetwork;
  audience: TargetAudience;
  objective: PostObjective;
  tone: PostTone;
  
  // NOVO: Adicione o tamanho
  length?: 'SHORT' | 'MEDIUM' | 'LONG'; 
  
  // ATUALIZADO: De fileData (objeto) para filesData (lista de objetos)
  filesData?: { name: string; base64: string; mimeType: string }[]; 
  
  context: string;
}