import { useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark, LockKeyhole, MapPin, ShieldAlert } from 'lucide-react';
import { codexApi } from '../api/codexApi';
import { useAsyncResource } from '../hooks/useAsyncResource';
import Badge from './Badge';
import EntityImage from './EntityImage';
import AsyncState from './AsyncState';
import Icon from './Icon';

export default function ItemDetail({ id, savedIds, onSave, saving }) {
  const loader = useCallback((signal) => codexApi.get(id, { signal }), [id]);
  const { data: item, status, error, retry } = useAsyncResource(loader);
  const heading = useRef(null);
  useEffect(() => {
    if (status === 'success') heading.current?.focus();
  }, [status]);
  return (
    <main id="main-content" className="detail-page page-width">
      <a className="back-link" href="#/archive">
        <ArrowLeft size={16} /> Back to archive
      </a>
      {status === 'loading' ? (
        <div className="detail-loading" role="status">
          <span className="loader" />
          Decrypting dossier…
        </div>
      ) : status === 'error' ? (
        <AsyncState error={error} onRetry={retry} />
      ) : (
        <>
          <div className="detail-heading">
            <div>
              <span className="eyebrow">
                DOSSIER {item.id.slice(0, 12)} / {item.type.toUpperCase()}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {item.entityName}
              </h1>
              <p>
                <MapPin size={16} /> {item.origin}
              </p>
            </div>
            <button
              className="button button--secondary"
              disabled={saving}
              aria-pressed={savedIds.includes(item.id)}
              onClick={() => onSave(item.id)}
            >
              <Bookmark size={16} fill={savedIds.includes(item.id) ? 'currentColor' : 'none'} />
              {savedIds.includes(item.id) ? 'Saved dossier' : 'Save dossier'}
            </button>
          </div>
          <div className="detail-grid">
            <section className="detail-lore">
              <EntityImage
                key={item.imageUrl}
                src={item.imageUrl}
                type={item.type}
                eager
                className="detail-image"
              />
              <div className="lore-body">
                <span className="eyebrow">FROM THE EXILIS COLLECTION</span>
                <h2>History & intelligence</h2>
                {item.historyText.split(/\n\s*\n/).map((paragraph, index) => (
                  <p key={`${item.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
            </section>
            <aside className="detail-sidebar">
              <div className="dossier-panel">
                <h2>Entity classification</h2>
                <dl>
                  <div>
                    <dt>Entity type</dt>
                    <dd>
                      <Icon name={item.type} size={16} />
                      {item.type}
                    </dd>
                  </div>
                  <div>
                    <dt>Threat designation</dt>
                    <dd>
                      <Badge value={item.threatLevel} variant="threat" />
                    </dd>
                  </div>
                  <div>
                    <dt>Operational status</dt>
                    <dd>
                      <Badge value={item.status} />
                    </dd>
                  </div>
                  <div>
                    <dt>Origin</dt>
                    <dd>{item.origin}</dd>
                  </div>
                  <div>
                    <dt>Clearance required</dt>
                    <dd>
                      <LockKeyhole size={15} /> Level {item.clearanceLevel} / 5
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="archive-notice">
                <ShieldAlert size={22} />
                <h3>Knowledge has a cost.</h3>
                <p>
                  Classification describes the last verified encounter. Approach all unconfirmed
                  intelligence with caution.
                </p>
                <a href="#/protocol">
                  Read archive protocol <span>↗</span>
                </a>
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
