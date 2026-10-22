import { describe, expect, it } from 'vitest';
import records from '../data/records.json';
import { DEFAULT_QUERY, selectRecords, validateRecord, THREAT_RANK } from '../domain/records';

describe('initial archive', () => {
  it('contains 120 unique, complete dossiers across five classifications', () => {
    expect(records).toHaveLength(120);
    expect(new Set(records.map((item) => item.id)).size).toBe(120);
    expect(new Set(records.map((item) => item.entityName)).size).toBe(120);
    expect(new Set(records.map((item) => item.type)).size).toBe(5);
    records.forEach((item) => {
      expect(item.historyText.length).toBeGreaterThan(300);
      expect(validateRecord({ ...item, imageUrl: '' })).toEqual({});
    });
  });
});

describe('catalogue queries', () => {
  it('searches name, origin and lore, ignoring case and extra whitespace', () => {
    const result = selectRecords(records, { ...DEFAULT_QUERY, search: '  ASHEN   navigators ' });
    expect(result.items.map((item) => item.entityName)).toEqual(['The Ashen Covenant']);
  });
  it('combines classification, threat, status and maximum clearance', () => {
    const result = selectRecords(records, {
      ...DEFAULT_QUERY,
      type: 'Planet',
      threat: 'Omega',
      status: 'Active',
      clearance: '3',
    });
    expect(result.total).toBeGreaterThan(0);
    result.items.forEach((item) => {
      expect(item.type).toBe('Planet');
      expect(item.threatLevel).toBe('Omega');
      expect(item.status).toBe('Active');
      expect(item.clearanceLevel).toBeLessThanOrEqual(3);
    });
  });
  it('sorts threat semantically and leaves the original order untouched', () => {
    const before = records.map((item) => item.id);
    const result = selectRecords(records, { ...DEFAULT_QUERY, sort: 'threat-desc', pageSize: 120 });
    const levels = result.items.map((item) => THREAT_RANK[item.threatLevel]);
    expect(levels).toEqual([...levels].sort((a, b) => b - a));
    expect(records.map((item) => item.id)).toEqual(before);
  });
  it.each(['name-asc', 'name-desc', 'clearance-asc', 'clearance-desc'])(
    'orders all results before paginating: %s',
    (sort) => {
      const all = selectRecords(records, { ...DEFAULT_QUERY, sort, pageSize: 120 });
      const second = selectRecords(records, { ...DEFAULT_QUERY, sort, page: 2 });
      expect(second.items).toEqual(all.items.slice(12, 24));
      const values = all.items.map((item) =>
        sort.startsWith('name') ? item.entityName : item.clearanceLevel,
      );
      const comparator = sort.startsWith('name') ? (a, b) => a.localeCompare(b) : (a, b) => a - b;
      const ordered = [...values].sort(comparator);
      if (sort.endsWith('desc')) ordered.reverse();
      expect(values).toEqual(ordered);
    },
  );
  it('clamps an out-of-range page and returns a consistent empty result', () => {
    expect(selectRecords(records, { ...DEFAULT_QUERY, page: 100 }).page).toBe(10);
    expect(
      selectRecords(records, { ...DEFAULT_QUERY, search: 'nonexistent-entity' }),
    ).toMatchObject({ items: [], total: 0, page: 1, pages: 1 });
  });
  it('restricts saved results by stable record IDs', () => {
    const result = selectRecords(records, { ...DEFAULT_QUERY, savedOnly: true }, [records[2].id]);
    expect(result.items).toEqual([records[2]]);
  });
  it('rejects unsafe URLs and incomplete form values', () => {
    const errors = validateRecord({
      ...records[0],
      entityName: '  ',
      origin: 'x',
      historyText: 'short',
      imageUrl: 'javascript:alert(1)',
      clearanceLevel: 9,
    });
    expect(Object.keys(errors)).toEqual(
      expect.arrayContaining(['entityName', 'origin', 'historyText', 'imageUrl', 'clearanceLevel']),
    );
  });
});
