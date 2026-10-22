import seedRecords from '../data/records.json';
import { selectRecords, validateRecord, TYPES, THREATS, STATUSES } from '../domain/records';

export const STORAGE_KEY = 'codex-exilis:archive:v1';
const SAVED_KEY = 'codex-exilis:saved:v1';

function delay(signal, ms = 420) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Request cancelled', 'AbortError'));
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Request cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', abort, { once: true });
  });
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error(
      'The archive could not be saved. Browser storage may be full or disabled. Free some space or allow site storage, then retry.',
    );
  }
}

function readRecords() {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    throw new Error(
      'Browser storage is unavailable. Allow site storage to connect to your archive.',
    );
  }
  if (raw === null) {
    write(STORAGE_KEY, seedRecords);
    return seedRecords;
  }
  try {
    const records = JSON.parse(raw);
    if (
      !Array.isArray(records) ||
      records.some(
        (record) =>
          !record ||
          typeof record.id !== 'string' ||
          typeof record.entityName !== 'string' ||
          typeof record.historyText !== 'string' ||
          typeof record.origin !== 'string' ||
          typeof record.imageUrl !== 'string' ||
          !TYPES.includes(record.type) ||
          !THREATS.includes(record.threatLevel) ||
          !STATUSES.includes(record.status) ||
          !Number.isInteger(record.clearanceLevel) ||
          record.clearanceLevel < 1 ||
          record.clearanceLevel > 5,
      ) ||
      new Set(records.map((record) => record.id)).size !== records.length
    )
      throw new Error();
    return records;
  } catch {
    throw new Error(
      'The local archive is unreadable. Your data has been preserved. Restore a valid backup in browser storage, then retry.',
    );
  }
}

function readSaved() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    throw new Error('Saved dossiers could not be read. Check browser storage and retry.');
  }
}

export const codexApi = {
  async list(query, { signal } = {}) {
    await delay(signal);
    const records = readRecords();
    const savedIds = readSaved();
    return {
      ...selectRecords(records, query, savedIds),
      savedIds,
      stats: {
        total: records.length,
        omega: records.filter((record) => record.threatLevel === 'Omega').length,
        quarantined: records.filter((record) => record.status === 'Quarantined').length,
        types: Object.fromEntries(
          TYPES.map((type) => [type, records.filter((record) => record.type === type).length]),
        ),
      },
    };
  },
  async get(id, { signal } = {}) {
    await delay(signal, 280);
    const record = readRecords().find((item) => item.id === id);
    if (!record)
      throw new Error(
        'This dossier is no longer in the archive. Return to the catalogue to find another record.',
      );
    return record;
  },
  async create(values, { signal } = {}) {
    await delay(signal, 600);
    const errors = validateRecord(values);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    const records = readRecords();
    const entityName = values.entityName.trim();
    if (
      records.some(
        (record) => record.entityName.toLocaleLowerCase() === entityName.toLocaleLowerCase(),
      )
    )
      throw new Error('An entity with this name already exists. Give this dossier a unique name.');
    const record = {
      ...values,
      id: `EX-${crypto.randomUUID()}`,
      entityName,
      origin: values.origin.trim(),
      historyText: values.historyText.trim(),
      imageUrl: values.imageUrl.trim() || './images/nebula.jpg',
      clearanceLevel: Number(values.clearanceLevel),
    };
    write(STORAGE_KEY, [record, ...records]);
    return record;
  },
  async toggleSaved(id, { signal } = {}) {
    await delay(signal, 120);
    const saved = readSaved();
    const next = saved.includes(id) ? saved.filter((value) => value !== id) : [...saved, id];
    write(SAVED_KEY, next);
    return next;
  },
};
