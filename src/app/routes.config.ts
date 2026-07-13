export const routes = {
  dashboard: '/',
  study: '/study',
  learn: (skill: string) => `/learn/${skill}`,
  topics: '/topics',
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
