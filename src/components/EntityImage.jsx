import { useState } from 'react';
import Icon from './Icon';

export default function EntityImage({ src, type, className = '', eager = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`entity-image entity-image--${type?.toLowerCase()} ${className}`}>
      {!failed && (
        <img src={src} alt="" loading={eager ? 'eager' : 'lazy'} onError={() => setFailed(true)} />
      )}
      <div className="entity-image__shade" />
      <div className="entity-image__glyph">
        <Icon name={type} size={74} />
      </div>
      <span className="entity-image__cross entity-image__cross--left">+</span>
      <span className="entity-image__cross entity-image__cross--right">+</span>
    </div>
  );
}
