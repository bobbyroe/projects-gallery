import type { Project } from './types';
import rawProjects from '../../data/projects.json';

export const PAGE_SIZE = 24;

export const allProjects: Project[] = (rawProjects as Project[])
  .slice()
  .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

export const categories: string[] = [
  ...new Set(allProjects.map((p) => p.category).filter(Boolean)),
].sort();

export const categoryCounts: Record<string, number> = Object.fromEntries(
  categories.map((cat) => [cat, allProjects.filter((p) => p.category === cat).length])
);

export type SortKey = 'date' | 'title' | 'category';

export function sortProjects(projects: Project[], sort: SortKey): Project[] {
  return projects.slice().sort((a, b) => {
    if (sort === 'title')    return a.title.localeCompare(b.title);
    if (sort === 'category') return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export function filterProjects(
  projects: Project[],
  search: string,
  category: string
): Project[] {
  const q = search.trim().toLowerCase();
  return projects.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}
