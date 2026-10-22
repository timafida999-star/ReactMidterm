import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AddItemForm from '../components/AddItemForm';
import { codexApi } from '../api/codexApi';

describe('controlled dossier form', () => {
  it('shows field-level validation and does not submit invalid data', () => {
    const create = vi.spyOn(codexApi, 'create');
    render(<AddItemForm onClose={() => {}} onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Add to archive/ }));
    expect(screen.getByLabelText('Entity name *')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('highlighted fields');
    expect(create).not.toHaveBeenCalled();
  });
  it('submits controlled values and exposes server errors without losing the draft', async () => {
    vi.spyOn(codexApi, 'create').mockRejectedValue(new Error('Storage is full'));
    render(<AddItemForm onClose={() => {}} onCreated={() => {}} />);
    fireEvent.change(screen.getByLabelText('Entity name *'), {
      target: { value: 'The Far Observatory' },
    });
    fireEvent.change(screen.getByLabelText('Origin *'), { target: { value: 'Outer Veil' } });
    fireEvent.change(screen.getByLabelText('History & intelligence *'), {
      target: {
        value:
          'An observatory at the edge of known space receives signals from a star that vanished many centuries before its construction.',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: /Add to archive/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Storage is full'));
    expect(screen.getByLabelText('Entity name *')).toHaveValue('The Far Observatory');
    expect(screen.getByRole('button', { name: /Add to archive/ })).toBeEnabled();
  });
});
