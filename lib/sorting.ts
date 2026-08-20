const spanishTitleCollator = new Intl.Collator('es', {
  numeric: true,
  sensitivity: 'base',
});

export function sortByTitleAscending<T extends { title: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => spanishTitleCollator.compare(a.title, b.title));
}
