import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, pageSize, onPage, onPageSize }) {
  const visible = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((value) => value >= 1 && value <= pages)
    .sort((a, b) => a - b);
  return (
    <div className="pagination">
      <label>
        Entries per page
        <select
          aria-label="Entries per page"
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
        >
          {[12, 24, 48].map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
      </label>
      <span className="pagination__range">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} entries
      </span>
      <nav aria-label="Pagination">
        <button aria-label="Previous page" disabled={page === 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={17} />
        </button>
        {visible.map((value, index) => (
          <span className="pagination__slot" key={value}>
            {index > 0 && value - visible[index - 1] > 1 && (
              <span className="pagination__ellipsis">…</span>
            )}
            <button
              aria-label={`Page ${value}`}
              aria-current={page === value ? 'page' : undefined}
              onClick={() => onPage(value)}
            >
              {value}
            </button>
          </span>
        ))}
        <button aria-label="Next page" disabled={page === pages} onClick={() => onPage(page + 1)}>
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  );
}
