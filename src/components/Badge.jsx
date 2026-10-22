export default function Badge({ value, variant = 'status' }) {
  return (
    <span className={`badge badge--${variant} badge--${value.toLowerCase()}`}>
      <span className="badge__dot" />
      {value}
      {variant === 'threat' && <span className="badge__suffix"> threat</span>}
    </span>
  );
}
