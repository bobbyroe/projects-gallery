import type { RefObject } from 'react';
import { categories } from '../lib/dataLoader';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  count: number;
  searchRef: RefObject<HTMLInputElement | null>;
}

export function Controls({ search, onSearch, category, onCategory, count, searchRef }: Props) {
  return (
    <div className="controls">
      <div className="search">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          ref={searchRef}
          type="search"
          placeholder="Search title, description, tags…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search projects"
        />
        <span className="search-kbd">⌘K</span>
      </div>

      <div className="select">
        <select
          value={category}
          onChange={(e) => onCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="controls-spacer" />
      <div className="count"><b>{count}</b> project{count !== 1 ? 's' : ''}</div>
    </div>
  );
}
