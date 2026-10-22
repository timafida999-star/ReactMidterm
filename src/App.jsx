import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, LayoutGrid, X } from 'lucide-react';
import { codexApi } from './api/codexApi';
import { DEFAULT_QUERY } from './domain/records';
import { useAsyncResource } from './hooks/useAsyncResource';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useRoute } from './hooks/useRoute';
import Header from './components/Header';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import AddItemForm from './components/AddItemForm';
import AsyncState, { SkeletonGrid } from './components/AsyncState';
import Protocol from './components/Protocol';
import Footer from './components/Footer';

export default function App() {
  const route = useRoute();
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [formOpen, setFormOpen] = useState(false);
  const [revision, setRevision] = useState(0);
  const [savedOverride, setSavedOverride] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const saveRequest = useRef(null);
  const addButton = useRef(null);
  const catalogueHeading = useRef(null);
  const search = useDebouncedValue(query.search);
  const savedOnly = route.page === 'saved';
  const { type, threat, status, clearance, sort, page, pageSize } = query;
  const requestQuery = useMemo(
    () => ({ search, type, threat, status, clearance, sort, page, pageSize, savedOnly }),
    [search, type, threat, status, clearance, sort, page, pageSize, savedOnly],
  );
  const loader = useCallback(
    (signal) => codexApi.list(requestQuery, { signal }),
    [requestQuery, revision],
  );
  const resource = useAsyncResource(loader);
  const savedIds = savedOverride ?? resource.data?.savedIds ?? [];
  const isCatalogue = route.page === 'archive' || savedOnly;

  useEffect(() => {
    const onStorage = (event) => {
      if (!event.key || event.key.startsWith('codex-exilis:')) {
        setSavedOverride(null);
        setRevision((value) => value + 1);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      saveRequest.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!notice || notice.error) return;
    const timer = setTimeout(() => setNotice(null), 5500);
    return () => clearTimeout(timer);
  }, [notice]);

  function changeQuery(patch, resetPage = true) {
    setQuery((previous) => ({ ...previous, ...patch, ...(resetPage ? { page: 1 } : {}) }));
    if ('page' in patch || 'pageSize' in patch) catalogueHeading.current?.focus();
  }
  function resetQuery() {
    setQuery({ ...DEFAULT_QUERY, pageSize: query.pageSize });
  }
  function searchArchive(value) {
    changeQuery({ search: value });
    if (!isCatalogue) window.location.hash = '/archive';
  }
  async function toggleSaved(id) {
    if (saveRequest.current) return;
    const controller = new AbortController();
    saveRequest.current = controller;
    setSaving(true);
    try {
      const next = await codexApi.toggleSaved(id, { signal: controller.signal });
      if (!controller.signal.aborted) {
        setSavedOverride(next);
        if (savedOnly) setRevision((value) => value + 1);
        setNotice({
          text: next.includes(id)
            ? 'Dossier added to your saved collection.'
            : 'Dossier removed from your saved collection.',
        });
      }
    } catch (error) {
      if (!controller.signal.aborted) setNotice({ text: error.message, error: true });
    } finally {
      if (!controller.signal.aborted) {
        setSaving(false);
        saveRequest.current = null;
      }
    }
  }
  function created(record) {
    setFormOpen(false);
    setQuery(DEFAULT_QUERY);
    setRevision((value) => value + 1);
    setNotice({ text: `${record.entityName} has been added to the archive.` });
    window.location.hash = `/entity/${encodeURIComponent(record.id)}`;
  }
  const loading = resource.status === 'loading' || search !== query.search;
  const data = resource.data && { ...resource.data, savedIds };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header
        route={route.page}
        search={query.search}
        onSearch={searchArchive}
        onAdd={() => setFormOpen(true)}
        savedCount={savedIds.length}
        addButtonRef={addButton}
      />
      {isCatalogue && (
        <main id="main-content">
          {!savedOnly && (
            <Hero stats={resource.data?.stats} onOmega={() => changeQuery({ threat: 'Omega' })} />
          )}
          <section
            className={`catalogue page-width ${savedOnly ? 'catalogue--saved' : ''}`}
            id="catalogue"
            aria-labelledby="catalogue-title"
          >
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  {savedOnly ? 'YOUR PERSONAL COLLECTION' : 'INDEX OF THE KNOWN & UNKNOWN'}
                </span>
                <h2 id="catalogue-title" ref={catalogueHeading} tabIndex={-1}>
                  {savedOnly ? 'Saved dossiers' : 'The archive'}
                  <span>
                    {savedOnly ? savedIds.length : (resource.data?.stats.total ?? '—')} records
                  </span>
                </h2>
              </div>
              <span className="section-heading__aside">
                <span className="signal-dot" /> KNOWLEDGE PRESERVED
              </span>
            </div>
            <FilterBar
              query={query}
              onChange={changeQuery}
              onReset={resetQuery}
              stats={resource.data?.stats}
            />
            <div className="result-line" aria-live="polite">
              <span>
                {loading ? (
                  'Retrieving records…'
                ) : resource.status === 'error' ? (
                  'Archive unavailable'
                ) : (
                  <>
                    <strong>{data.total}</strong> {savedOnly ? 'saved ' : ''}entities found
                    {query.search && <> for “{query.search}”</>}
                  </>
                )}
              </span>
              <span>
                <LayoutGrid size={14} /> DOSSIER VIEW
              </span>
            </div>
            {loading ? (
              <SkeletonGrid />
            ) : resource.status === 'error' ? (
              <AsyncState error={resource.error} onRetry={resource.retry} />
            ) : data.total === 0 ? (
              <AsyncState saved={savedOnly} onRetry={resetQuery} />
            ) : (
              <ItemList
                data={data}
                query={query}
                onChange={changeQuery}
                onSave={toggleSaved}
                saving={saving}
              />
            )}
          </section>
        </main>
      )}
      {route.page === 'detail' && (
        <ItemDetail
          key={route.id}
          id={route.id}
          savedIds={savedIds}
          onSave={toggleSaved}
          saving={saving}
        />
      )}
      {route.page === 'protocol' && <Protocol />}
      <Footer />
      {formOpen && (
        <AddItemForm
          onClose={() => setFormOpen(false)}
          onCreated={created}
          returnFocusRef={addButton}
        />
      )}
      {notice && (
        <div
          className={`toast ${notice.error ? 'toast--error' : ''}`}
          role={notice.error ? 'alert' : 'status'}
        >
          {!notice.error && <CheckCircle2 size={18} />}
          <span>{notice.text}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice(null)}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
