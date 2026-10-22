import { BookOpen, Database, ShieldCheck } from 'lucide-react';
import { THREATS } from '../domain/records';
import Badge from './Badge';

const threatDescriptions = {
  Alpha: 'Localized risk. Observation by standard field teams is permitted.',
  Beta: 'Significant risk. Specialist equipment and coordinated observation are required.',
  Gamma: 'System-wide risk. Direct contact is limited to authorized expeditions.',
  Omega: 'Existential or unbounded risk. Remote observation is the only approved protocol.',
};

export default function Protocol() {
  return (
    <main id="main-content" className="protocol page-width">
      <span className="eyebrow">EXILIS FIELD MANUAL / REVISION 01</span>
      <h1>The archive remembers.</h1>
      <p className="protocol__intro">
        A guide to reading the unknown. Every dossier is a fragment of a larger truth;
        classification gives that fragment context.
      </p>
      <div className="protocol-grid">
        <section className="dossier-panel">
          <ShieldCheck />
          <h2>Threat designations</h2>
          {THREATS.map((threat) => (
            <div className="protocol-threat" key={threat}>
              <Badge value={threat} variant="threat" />
              <p>{threatDescriptions[threat]}</p>
            </div>
          ))}
        </section>
        <section className="dossier-panel">
          <BookOpen />
          <h2>Reading a dossier</h2>
          <h3>Five classifications</h3>
          <p>
            Factions, characters, weapons, spacecraft and planets share one catalogue. Search names,
            origins and the full text of their histories.
          </p>
          <h3>Clearance levels 1–5</h3>
          <p>
            Clearance describes sensitivity, from field intelligence to sealed records. The
            clearance filter includes records up to the selected level. All dossiers are readable in
            this edition.
          </p>
          <h3>Status is an observation</h3>
          <p>
            Active, Destroyed, Unknown and Quarantined describe the last recorded state. They are
            independent of an entity’s threat designation.
          </p>
        </section>
        <section className="dossier-panel">
          <Database />
          <h2>Your personal archive</h2>
          <p>
            This is an original fictional universe. Its 120 initial dossiers are included with the
            application.
          </p>
          <p>
            New entries and saved dossiers stay in this browser. They survive a reload, but are not
            shared between devices. Clearing site data removes your additions.
          </p>
          <p>
            The archive uses a simulated asynchronous API. If storage is blocked or unreadable, a
            recovery message replaces the list without silently deleting your records.
          </p>
          <a href="#/archive" className="button button--secondary">
            Return to the archive →
          </a>
        </section>
      </div>
    </main>
  );
}
