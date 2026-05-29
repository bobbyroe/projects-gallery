import { allProjects, categoryCounts } from '../lib/dataLoader';

interface Props {
  activeCategory: string;
  onCategory: (v: string) => void;
}

export function CategoryStrip({ activeCategory, onCategory }: Props) {
  const cats = Object.keys(categoryCounts).sort();

  return (
    <div className="cat-strip" role="group" aria-label="Filter by category">
      <button
        className={`cat-pill${activeCategory === 'all' ? ' active' : ''}`}
        onClick={() => onCategory('all')}
      >
        all <span className="n">{allProjects.length}</span>
      </button>
      {cats.map((cat) => (
        <button
          key={cat}
          className={`cat-pill${activeCategory === cat ? ' active' : ''}`}
          onClick={() => onCategory(cat)}
        >
          {cat} <span className="n">{categoryCounts[cat]}</span>
        </button>
      ))}
    </div>
  );
}
