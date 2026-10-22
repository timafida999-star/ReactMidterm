export const TYPES = ['Faction', 'Character', 'Weapon', 'Spacecraft', 'Planet'];
export const THREATS = ['Alpha', 'Beta', 'Gamma', 'Omega'];
export const STATUSES = ['Active', 'Destroyed', 'Unknown', 'Quarantined'];
export const THREAT_RANK = { Alpha: 1, Beta: 2, Gamma: 3, Omega: 4 };
export const DEFAULT_QUERY = {
  search: '',
  type: 'All',
  threat: 'All',
  status: 'All',
  clearance: 'All',
  sort: 'catalogue',
  page: 1,
  pageSize: 12,
};
export const SORT_OPTIONS = [
  ['catalogue', 'Catalogue order'],
  ['name-asc', 'Name: A–Z'],
  ['name-desc', 'Name: Z–A'],
  ['threat-desc', 'Threat: highest first'],
  ['threat-asc', 'Threat: lowest first'],
  ['clearance-desc', 'Clearance: highest first'],
  ['clearance-asc', 'Clearance: lowest first'],
];

export function validateRecord(values) {
  const errors = {};
  if (values.entityName.trim().length < 3 || values.entityName.trim().length > 80)
    errors.entityName = 'Use 3–80 characters for the entity name.';
  if (values.origin.trim().length < 3 || values.origin.trim().length > 80)
    errors.origin = 'Use 3–80 characters for the origin.';
  if (values.historyText.trim().length < 80 || values.historyText.trim().length > 6000)
    errors.historyText = 'History must contain 80–6,000 characters.';
  if (!TYPES.includes(values.type)) errors.type = 'Choose an entity type.';
  if (!THREATS.includes(values.threatLevel)) errors.threatLevel = 'Choose a threat level.';
  if (!STATUSES.includes(values.status)) errors.status = 'Choose an operational status.';
  if (
    !Number.isInteger(Number(values.clearanceLevel)) ||
    Number(values.clearanceLevel) < 1 ||
    Number(values.clearanceLevel) > 5
  )
    errors.clearanceLevel = 'Choose a clearance level from 1 to 5.';
  if (values.imageUrl.trim()) {
    try {
      const url = new URL(values.imageUrl);
      if (url.protocol !== 'https:') throw new Error();
    } catch {
      errors.imageUrl = 'Enter a valid HTTPS image URL, or leave this blank.';
    }
  }
  return errors;
}

export function selectRecords(records, query, savedIds = []) {
  const terms = query.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = records.filter((record) => {
    const text =
      `${record.entityName} ${record.origin} ${record.type} ${record.historyText}`.toLocaleLowerCase();
    return (
      terms.every((term) => text.includes(term)) &&
      (query.type === 'All' || record.type === query.type) &&
      (query.threat === 'All' || record.threatLevel === query.threat) &&
      (query.status === 'All' || record.status === query.status) &&
      (query.clearance === 'All' || record.clearanceLevel <= Number(query.clearance)) &&
      (!query.savedOnly || savedIds.includes(record.id))
    );
  });
  const compare = {
    'name-asc': (a, b) => a.entityName.localeCompare(b.entityName),
    'name-desc': (a, b) => b.entityName.localeCompare(a.entityName),
    'threat-desc': (a, b) => THREAT_RANK[b.threatLevel] - THREAT_RANK[a.threatLevel],
    'threat-asc': (a, b) => THREAT_RANK[a.threatLevel] - THREAT_RANK[b.threatLevel],
    'clearance-desc': (a, b) => b.clearanceLevel - a.clearanceLevel,
    'clearance-asc': (a, b) => a.clearanceLevel - b.clearanceLevel,
  }[query.sort];
  if (compare) filtered.sort((a, b) => compare(a, b) || a.id.localeCompare(b.id));
  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(1, query.page), pages);
  return {
    items: filtered.slice((page - 1) * query.pageSize, page * query.pageSize),
    total,
    page,
    pages,
  };
}
