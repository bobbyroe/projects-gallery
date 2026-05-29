import { useState } from 'react';
import type { Project } from '../lib/types';
import { fmtDate } from '../lib/dataLoader';

interface Props {
  project: Project;
}

const INVALID_YT = new Set(['', 'xxx']);

export function ProjectCard({ project }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasYt = project.youtubeUrl && !INVALID_YT.has(project.youtubeUrl);

  function openYt(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(project.youtubeUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <a
      className="card"
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="thumb">
        {project.media && !imgFailed ? (
          <img
            src={`/media/${project.media}`}
            alt={project.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="ph" />
        )}
      </div>

      <div className="meta">
        <div className="meta-l">
          <h3 className="title">{project.title}</h3>
          <div className="sub">
            <span className="cat">{project.category}</span>
            <span className="dot" />
            <span>{fmtDate(project.createdAt)}</span>
          </div>
          {hasYt && (
            <button className="yt-badge" onClick={openYt} aria-label={`Watch ${project.title} on YouTube`}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch on YouTube
            </button>
          )}
        </div>
        <span className="ext" aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7" /><path d="M8 7h9v9" />
          </svg>
        </span>
      </div>
    </a>
  );
}
