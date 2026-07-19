import { Input } from '@/components/ui/Input';

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
};

export function SearchBar({ query, onQueryChange }: SearchBarProps) {
  return (
    <Input
      id="global-search"
      label="Search"
      type="search"
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder="Kanji, vocabulary, grammar, topics…"
      autoComplete="off"
      autoFocus
    />
  );
}
