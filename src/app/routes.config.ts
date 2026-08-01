export const routes = {
  dashboard: '/',
  study: '/study',
  learnHub: '/learn',
  learn: (skill: string) => `/learn/${skill}`,
  lessons: (group: string) => `/learn/lessons/${group}`,
  practice: '/practice',
  itemDetail: (id: string) => `/items/${id}`,
  topics: '/topics',
  topicDetail: (id: string) => `/topics/${id}`,
  add: '/add',
  import: '/import',
  search: '/search',
  settings: '/settings',
  login: '/login',
} as const;

export const learnSkills = [
  'vocabulary',
  'kanji',
  'grammar',
  'reading',
  'listening',
] as const;

export type LearnSkill = (typeof learnSkills)[number];
