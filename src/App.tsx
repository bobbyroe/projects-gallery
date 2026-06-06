import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { allProjects, filterProjects, sortProjects, PAGE_SIZE } from './lib/dataLoader';
import type { SortKey } from './lib/dataLoader';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { CategoryStrip } from './components/CategoryStrip';
import { Grid } from './components/Grid';
import './index.css';

export default function App() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortKey>('date');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = useMemo(
    () => sortProjects(filterProjects(allProjects, debouncedSearch, category), sort),
    [debouncedSearch, category, sort]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + PAGE_SIZE);
  }, []);

  function handleCategory(cat: string) {
    setCategory(cat);
  }

  return (
    <>
      <Header />

      <section className="eyebrow-band shell">
        <p className="eyebrow">Tutorial Companions · 2021 – 2026</p>
      </section>

      <div className="shell">
        <Controls
          search={search}
          onSearch={setSearch}
          category={category}
          onCategory={handleCategory}
          sort={sort}
          onSort={setSort}
          count={filtered.length}
          searchRef={searchRef}
        />

        <CategoryStrip
          activeCategory={category}
          onCategory={handleCategory}
        />

        <Grid
          projects={visible}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />

        <footer className="footer">
          <div>© 2026 Robot Bobby</div>
          <div className="footer-r">
            <a href="#" target="_blank" rel="noopener">Source on GitHub</a>
            <a href="#" target="_blank" rel="noopener">YouTube</a>
          </div>
        </footer>
      </div>
    </>
  );
}
