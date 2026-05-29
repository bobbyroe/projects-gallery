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
