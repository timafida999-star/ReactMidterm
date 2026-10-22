import { ArrowUpRight, Bookmark, LockKeyhole, MapPin } from 'lucide-react';
import Badge from './Badge';
import Icon from './Icon';
import EntityImage from './EntityImage';

export default function ItemCard({ item, saved, saving, onSave }) {
  return (
    <article className="item-card">
      <a
        href={`#/entity/${encodeURIComponent(item.id)}`}
        className="item-card__link"
        aria-label={`Open ${item.entityName}`}
      >
        <div className="item-card__visual">
          <EntityImage src={item.imageUrl} type={item.type} />
          <span className="item-card__number">{item.id.slice(0, 12)}</span>
          <Badge value={item.threatLevel} variant="threat" />
        </div>
        <div className="item-card__body">
          <span className="item-card__type">
            <Icon name={item.type} size={13} /> {item.type}
          </span>
          <h3>
            {item.entityName}
            <ArrowUpRight size={18} />
          </h3>
          <span className="item-card__origin">
            <MapPin size={12} />
            {item.origin}
          </span>
          <p>{item.historyText.split('\n')[0]}</p>
        </div>
      </a>
      <div className="item-card__footer">
        <Badge value={item.status} />
        <span className="clearance">
          <LockKeyhole size={12} /> LVL {item.clearanceLevel}
        </span>
        <button
          className={`save-button ${saved ? 'is-saved' : ''}`}
          disabled={saving}
          aria-label={`${saved ? 'Unsave' : 'Save'} ${item.entityName}`}
          aria-pressed={saved}
          onClick={() => onSave(item.id)}
        >
          <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
