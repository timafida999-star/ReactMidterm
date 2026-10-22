import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { TYPES, THREATS, STATUSES, SORT_OPTIONS } from '../domain/records';
import Icon from './Icon';

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([id, text]) => (
          <option key={id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function FilterBar({ query, onChange, onReset, stats }) {
  const active =
    query.threat !== 'All' ||
    query.status !== 'All' ||
    query.clearance !== 'All' ||
    query.search ||
    query.type !== 'All' ||
    query.sort !== 'catalogue';
  return (
    <div className="control-panel">
      <div className="category-tabs" aria-label="Entity type">
        {['All', ...TYPES].map((type) => (
          <button key={type} aria-pressed={query.type === type} onClick={() => onChange({ type })}>
            <Icon name={type} />
            <span>
              {type === 'All' ? 'All entities' : type === 'Spacecraft' ? 'Spacecraft' : `${type}s`}
            </span>
            <small>{type === 'All' ? (stats?.total ?? '—') : (stats?.types[type] ?? '—')}</small>
          </button>
        ))}
      </div>
      <div className="filter-row">
        <span className="filter-row__label">
          <SlidersHorizontal size={16} /> Refine
        </span>
        <FilterSelect
          label="Threat"
          value={query.threat}
          options={['All', ...THREATS].map((value) => [
            value,
            value === 'All' ? 'All threats' : value,
          ])}
          onChange={(threat) => onChange({ threat })}
        />
        <FilterSelect
          label="Status"
          value={query.status}
          options={['All', ...STATUSES].map((value) => [
            value,
            value === 'All' ? 'All statuses' : value,
          ])}
          onChange={(status) => onChange({ status })}
        />
        <FilterSelect
          label="Clearance"
          value={query.clearance}
          options={['All', '1', '2', '3', '4', '5'].map((value) => [
            value,
            value === 'All' ? 'All levels' : `Up to level ${value}`,
          ])}
          onChange={(clearance) => onChange({ clearance })}
        />
        {active && (
          <button className="reset-button" onClick={onReset}>
            <RotateCcw size={14} /> Reset
          </button>
        )}
        <div className="filter-row__sort">
          <FilterSelect
            label="Sort by"
            value={query.sort}
            options={SORT_OPTIONS}
            onChange={(sort) => onChange({ sort })}
          />
        </div>
      </div>
    </div>
  );
}
