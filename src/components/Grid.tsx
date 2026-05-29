import { useEffect, useRef } from 'react';
import type { Project } from '../lib/types';
import { ProjectCard } from './ProjectCard';

interface Props {
  projects: Project[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export function Grid({ projects, hasMore, onLoadMore }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const sentinel = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) onLoadMore(); } },
      { rootMargin: '400px 0px' }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, onLoadMore]);

  return (
    <>
      {projects.length === 0 && (
        <div className="no-results">No projects match your search.</div>
      )}
      <main className="grid" aria-label="Projects">
        {projects.map((p) => <ProjectCard key={p.slug} project={p} />)}
      </main>
      <div ref={sentinelRef} className={`scroll-status${hasMore ? '' : ' is-done'}`}>
        {hasMore ? (
          <>
            <span className="spinner" aria-hidden="true" />
            <div className="note">Loading more…</div>
          </>
        ) : projects.length > 0 ? (
          <div className="note">{projects.length} projects</div>
        ) : null}
      </div>
    </>
  );
}
