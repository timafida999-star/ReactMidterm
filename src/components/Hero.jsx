import { ArrowDown, ArrowUpRight, Radio } from 'lucide-react';
import Icon from './Icon';

export default function Hero({ stats, onOmega }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__image" />
      <div className="hero__grid" />
      <div className="hero__content">
        <div className="eyebrow">
          <span className="signal-dot" /> EXILIS ARCHIVE / EST. 731 A.E.
        </div>
        <h1 id="hero-title">
          Some knowledge
          <br />
          should stay <em>buried.</em>
        </h1>
        <p>
          Lost worlds. Ancient orders. Things that should not exist.
          <br className="desktop-break" /> Enter the living record of a universe beyond the veil.
        </p>
        <a className="hero__link" href="#catalogue">
          Explore the archive <ArrowDown size={16} />
        </a>
      </div>
      <div className="hero__coordinate">
        <span>SECTOR 09 / THE OUTER VEIL</span>
        <span>RA 23h 17m · DEC −04° 38′</span>
      </div>
      <div className="hero__transmission">
        <Radio size={16} />
        <span>
          TRANSMISSION 001<span>What remains is what we remember.</span>
        </span>
      </div>
      <div className="stats-strip">
        <div>
          <Icon name="archive" />
          <strong>{stats?.total ?? '—'}</strong>
          <span>Archived entities</span>
        </div>
        <div>
          <Icon name="All" />
          <strong>05</strong>
          <span>Entity classifications</span>
        </div>
        <button onClick={onOmega}>
          <Icon name="threat" />
          <strong>{stats?.omega ?? '—'}</strong>
          <span>Omega-level threats</span>
          <ArrowUpRight size={16} />
        </button>
        <div>
          <span className="signal-dot" />
          <strong className="stats-strip__online">Local archive</strong>
          <span>Exilis terminal / 01</span>
        </div>
      </div>
    </section>
  );
}
