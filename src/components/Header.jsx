import { Plus, Search, X, Bookmark, BookOpen, ShieldCheck } from 'lucide-react';

export default function Header({ route, search, onSearch, onAdd, savedCount, addButtonRef }) {
  return (
    <header className="header">
      <a className="brand" href="#/archive" aria-label="Codex Exilis home">
        <img src="./sigil.svg" alt="" />
        <span>
          <strong>EXILIS</strong>
          <small>THE FORBIDDEN ARCHIVE</small>
        </span>
      </a>
      <nav className="header__nav" aria-label="Main navigation">
        <a
          href="#/archive"
          aria-current={route === 'archive' || route === 'detail' ? 'page' : undefined}
        >
          <BookOpen size={16} /> Archive
        </a>
        <a href="#/saved" aria-current={route === 'saved' ? 'page' : undefined}>
          <Bookmark size={16} /> Saved <span className="nav-count">{savedCount}</span>
        </a>
        <a href="#/protocol" aria-current={route === 'protocol' ? 'page' : undefined}>
          <ShieldCheck size={16} /> Protocol
        </a>
      </nav>
      <div className="header__actions">
        <div className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            aria-label="Search the archive"
            placeholder="Search the archive…"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          {search && (
            <button aria-label="Clear search" onClick={() => onSearch('')}>
              <X size={15} />
            </button>
          )}
        </div>
        <button
          ref={addButtonRef}
          className="button button--primary header__add"
          aria-label="New entry"
          onClick={onAdd}
        >
          <Plus size={17} />
          <span>New entry</span>
        </button>
      </div>
    </header>
  );
}
