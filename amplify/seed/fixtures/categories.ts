/** Discover shelf categories — declarative seed data (gate-exempt fixture). */
export interface SeedCategory {
  name: string;
  slug: string;
  label?: string;
  sortOrder: number;
}

export const seedCategories: SeedCategory[] = [
  { name: 'Languages', slug: 'languages', label: 'Languages', sortOrder: 1 },
  { name: 'Mythology', slug: 'mythology', label: 'Myths & Legends', sortOrder: 2 },
  { name: 'Scripture', slug: 'scripture', label: 'Scripture & Verses', sortOrder: 3 },
  { name: 'Science', slug: 'science', label: 'Science & Nature', sortOrder: 4 },
  { name: 'History', slug: 'history', label: 'History', sortOrder: 5 },
  { name: 'Geography', slug: 'geography', label: 'Geography', sortOrder: 6 },
  { name: 'Miscellaneous', slug: 'miscellaneous', label: 'Just for Fun', sortOrder: 7 },
  { name: 'Sports', slug: 'sports', label: 'Sports', sortOrder: 8 },
  { name: 'Music', slug: 'music', label: 'Music', sortOrder: 9 },
  { name: 'Food & Drink', slug: 'food', label: 'Food & Drink', sortOrder: 10 },
];
