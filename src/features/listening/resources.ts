/**
 * Curated external listening resources for JLPT N4 prep.
 * There is no official free JLPT audio list — these are community / practice
 * materials. Users can also track their own textbook audio via LogPracticeForm.
 */
export type ListeningResource = {
  title: string;
  url: string;
  description: string;
};

export const jlptN4ListeningResources: readonly ListeningResource[] = [
  {
    title: 'LearnJP — 5 JLPT N4 Practice Tests (PDF + MP3)',
    url: 'https://learnjp.net/5-jlpt-n4-practice-tests.html',
    description: 'Full practice tests with downloadable listening audio.',
  },
  {
    title: 'LearnJP — JLPT N4 practice test archive',
    url: 'https://learnjp.net/jlpt-n4-practice-test.html',
    description: 'Past-style exam packs with listening files and answers.',
  },
  {
    title: 'NHK Easy News (slow spoken Japanese)',
    url: 'https://www3.nhk.or.jp/news/easy/',
    description:
      'Not exam-format, but excellent graded listening for daily practice around N4–N3.',
  },
];
