import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { codexApi, STORAGE_KEY } from '../api/codexApi';
import { DEFAULT_QUERY } from '../domain/records';
import records from '../data/records.json';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

async function settle(promise) {
  await vi.runAllTimersAsync();
  return promise;
}

describe('simulated API', () => {
  it('seeds once and persists new records without replacing existing entries', async () => {
    expect((await settle(codexApi.list(DEFAULT_QUERY))).stats.total).toBe(120);
    const created = await settle(
      codexApi.create({ ...records[0], entityName: 'The Test Observatory', imageUrl: '' }),
    );
    expect(created.id).not.toBe(records[0].id);
    expect((await settle(codexApi.list(DEFAULT_QUERY))).stats.total).toBe(121);
    expect((await settle(codexApi.get(created.id))).entityName).toBe('The Test Observatory');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(121);
  });
  it('aborts pending reads and writes without committing a record', async () => {
    const controller = new AbortController();
    const creation = codexApi.create(
      { ...records[0], entityName: 'Cancelled', imageUrl: '' },
      { signal: controller.signal },
    );
    const assertion = expect(creation).rejects.toMatchObject({ name: 'AbortError' });
    controller.abort();
    await assertion;
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves corrupt storage instead of silently resetting it', async () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    const assertion = expect(codexApi.list(DEFAULT_QUERY)).rejects.toThrow('unreadable');
    await vi.runAllTimersAsync();
    await assertion;
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });
  it('rejects duplicate names without changing the record count', async () => {
    await settle(codexApi.list(DEFAULT_QUERY));
    const assertion = expect(codexApi.create({ ...records[0], imageUrl: '' })).rejects.toThrow(
      'already exists',
    );
    await vi.runAllTimersAsync();
    await assertion;
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY))).toHaveLength(120);
  });
  it('returns an actionable failure when storage cannot be written', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const assertion = expect(codexApi.list(DEFAULT_QUERY)).rejects.toThrow('could not be saved');
    await vi.runAllTimersAsync();
    await assertion;
  });
  it('persists bookmark toggles and filters the saved collection', async () => {
    await settle(codexApi.toggleSaved(records[0].id));
    const saved = await settle(codexApi.list({ ...DEFAULT_QUERY, savedOnly: true }));
    expect(saved.items).toEqual([records[0]]);
    await settle(codexApi.toggleSaved(records[0].id));
    expect((await settle(codexApi.list({ ...DEFAULT_QUERY, savedOnly: true }))).total).toBe(0);
  });
});
