import { useParams } from 'react-router-dom';
import { learnSkills } from '@/app/routes.config';
import { PageLayout } from '@/components/layout/PageLayout';
import { PlaceholderCard } from '@/components/ui/PlaceholderCard';

export function LearnBrowsePage() {
  const { skill } = useParams<{ skill: string }>();
  const isValidSkill = learnSkills.includes(skill as (typeof learnSkills)[number]);

  return (
    <PageLayout
      title={isValidSkill ? `Learn — ${skill}` : 'Learn'}
      description="Browse items by skill, level, topic, and source."
    >
      <PlaceholderCard>
        {isValidSkill
          ? `Browse UI for ${skill} will appear here.`
          : 'Unknown skill. Use vocabulary, kanji, grammar, reading, or listening.'}
      </PlaceholderCard>
    </PageLayout>
  );
}
