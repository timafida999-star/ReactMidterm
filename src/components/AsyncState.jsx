import { AlertTriangle, SearchX, RefreshCw } from 'lucide-react';

export function SkeletonGrid() {
  return (
    <div className="skeleton-container" role="status">
      <span className="sr-only">Retrieving archive records…</span>
      <div className="item-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <div className="skeleton-card" key={index}>
            <div />
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AsyncState({ error, onRetry, saved = false }) {
  return (
    <div className="async-state" role={error ? 'alert' : 'status'}>
      {error ? <AlertTriangle size={32} /> : <SearchX size={32} />}
      <span className="eyebrow">{error ? 'CONNECTION INTERRUPTED' : 'NO SIGNAL FOUND'}</span>
      <h2>
        {error
          ? 'The archive is out of reach.'
          : saved
            ? 'No saved dossiers here.'
            : 'Nothing beyond this horizon.'}
      </h2>
      <p>
        {error
          ? error.message
          : saved
            ? 'Bookmark a dossier in the archive, or clear your filters to see more saved entries.'
            : 'No entities match these coordinates. Try another search or broaden your filters.'}
      </p>
      <button className="button button--secondary" onClick={onRetry}>
        <RefreshCw size={15} />
        {error ? 'Retry connection' : 'Reset search & filters'}
      </button>
      {saved && !error && (
        <a className="text-link" href="#/archive">
          Explore the archive →
        </a>
      )}
    </div>
  );
}
