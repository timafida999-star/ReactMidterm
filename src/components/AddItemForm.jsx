import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, FilePlus2, X } from 'lucide-react';
import { codexApi } from '../api/codexApi';
import { TYPES, THREATS, STATUSES, validateRecord } from '../domain/records';

const initialValues = {
  entityName: '',
  type: 'Faction',
  threatLevel: 'Alpha',
  origin: '',
  status: 'Unknown',
  imageUrl: '',
  historyText: '',
  clearanceLevel: '1',
};

function Field({ name, label, error, children, hint, wide = false }) {
  return (
    <div className={`form-field ${wide ? 'form-field--wide' : ''}`}>
      <label htmlFor={`entry-${name}`}>{label}</label>
      {children}
      {error ? (
        <span className="field-error" id={`${name}-feedback`}>
          {error}
        </span>
      ) : hint ? (
        <span className="field-hint" id={`${name}-feedback`}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default function AddItemForm({ onClose, onCreated, returnFocusRef }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [pending, setPending] = useState(false);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  function change(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
    setSubmitError('');
  }
  function inputProps(name) {
    return {
      id: `entry-${name}`,
      name,
      value: values[name],
      onChange: change,
      'aria-invalid': Boolean(errors[name]),
      'aria-describedby':
        errors[name] || name === 'imageUrl' || name === 'historyText'
          ? `${name}-feedback`
          : undefined,
    };
  }
  async function submit(event) {
    event.preventDefault();
    if (request.current && !request.current.signal.aborted) return;
    const nextErrors = validateRecord(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setSubmitError('');
    try {
      const record = await codexApi.create(values, { signal: controller.signal });
      if (!controller.signal.aborted) onCreated(record);
    } catch (error) {
      if (!controller.signal.aborted) setSubmitError(error.message);
    } finally {
      if (!controller.signal.aborted) {
        setPending(false);
        request.current = null;
      }
    }
  }
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className="entry-modal"
          onCloseAutoFocus={(event) => {
            if (returnFocusRef?.current) {
              event.preventDefault();
              returnFocusRef.current.focus();
            }
          }}
        >
          <div className="entry-modal__header">
            <div className="eyebrow">
              <FilePlus2 size={16} /> ARCHIVE INTAKE
            </div>
            <Dialog.Close className="icon-button" aria-label="Close new entry">
              <X size={20} />
            </Dialog.Close>
            <Dialog.Title>Record the unknown.</Dialog.Title>
            <Dialog.Description>
              Every discovery belongs in the archive. Create a new entity dossier.
            </Dialog.Description>
          </div>
          <form onSubmit={submit} noValidate>
            <fieldset disabled={pending} className="form-grid">
              <Field name="entityName" label="Entity name *" error={errors.entityName} wide>
                <input
                  {...inputProps('entityName')}
                  placeholder="e.g. The Obsidian Oracle"
                  maxLength={80}
                  autoComplete="off"
                />
              </Field>
              <Field name="type" label="Classification *" error={errors.type}>
                <select {...inputProps('type')}>
                  {TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field name="origin" label="Origin *" error={errors.origin}>
                <input
                  {...inputProps('origin')}
                  placeholder="System, sector or homeworld"
                  maxLength={80}
                />
              </Field>
              <Field name="threatLevel" label="Threat level *" error={errors.threatLevel}>
                <select {...inputProps('threatLevel')}>
                  {THREATS.map((threat) => (
                    <option key={threat}>{threat}</option>
                  ))}
                </select>
              </Field>
              <Field name="status" label="Operational status *" error={errors.status}>
                <select {...inputProps('status')}>
                  {STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
              <Field name="clearanceLevel" label="Clearance level *" error={errors.clearanceLevel}>
                <select {...inputProps('clearanceLevel')}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                name="imageUrl"
                label="Image URL"
                error={errors.imageUrl}
                hint="Optional HTTPS link. Archive artwork is used by default."
              >
                <input
                  {...inputProps('imageUrl')}
                  type="url"
                  placeholder="https://…"
                  maxLength={2000}
                />
              </Field>
              <Field
                name="historyText"
                label="History & intelligence *"
                error={errors.historyText}
                hint={`${values.historyText.length.toLocaleString()} / 6,000 characters · minimum 80`}
                wide
              >
                <textarea
                  {...inputProps('historyText')}
                  rows={6}
                  maxLength={6000}
                  placeholder="Document the discovery, its history, and what remains unexplained…"
                />
              </Field>
            </fieldset>
            {Object.values(errors).some(Boolean) && (
              <p className="form-error" role="alert">
                Review the highlighted fields before filing this dossier.
              </p>
            )}
            {submitError && (
              <p className="form-error" role="alert">
                {submitError}
              </p>
            )}
            <div className="form-footer">
              <span>* Required fields</span>
              <button type="button" className="button button--secondary" onClick={onClose}>
                {pending ? 'Cancel request' : 'Cancel'}
              </button>
              <button className="button button--primary" disabled={pending} type="submit">
                {pending ? (
                  <>
                    <span className="loader" /> Filing dossier…
                  </>
                ) : (
                  <>
                    Add to archive <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
