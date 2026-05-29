import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <div className="brand">
          <div className="brand-mark">rb</div>
          <span className="brand-name">Robot Bobby</span>
          <span className="brand-sep">/</span>
          <span className="brand-section">Projects</span>
        </div>
        <nav className="nav">
          <a className="nav-link" href="#" target="_blank" rel="noopener">YouTube</a>
          <a className="nav-link" href="#" target="_blank" rel="noopener">GitHub</a>
          <a className="nav-link" href="#" target="_blank" rel="noopener">CodePen</a>
          <span className="nav-divider" />
          <a className="nav-cross" href="#" target="_blank" rel="noopener">
            Experiments Gallery <span className="arrow">→</span>
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
