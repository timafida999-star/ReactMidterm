import ItemCard from './ItemCard';
import Pagination from './Pagination';

export default function ItemList({ data, query, onChange, onSave, saving }) {
  return (
    <>
      <div className="item-grid">
        {data.items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            saved={data.savedIds.includes(item.id)}
            saving={saving}
            onSave={onSave}
          />
        ))}
      </div>
      <Pagination
        {...data}
        pageSize={query.pageSize}
        onPage={(page) => onChange({ page }, false)}
        onPageSize={(pageSize) => onChange({ pageSize })}
      />
    </>
  );
}
