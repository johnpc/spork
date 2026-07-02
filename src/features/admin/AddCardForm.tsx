import { useState } from 'react';
import type { CardInput } from './adminCardApi';

/** Inline form to append a card. Renders only; clears on successful add. */
export function AddCardForm({ onAdd }: { onAdd: (input: CardInput) => Promise<void> }) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [busy, setBusy] = useState(false);
  const canAdd = front.trim().length > 0 && back.trim().length > 0 && !busy;

  async function submit() {
    if (!canAdd) return;
    setBusy(true);
    try {
      await onAdd({ front: front.trim(), back: back.trim() });
      setFront('');
      setBack('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="add-card" data-testid="add-card-form">
      <input
        aria-label="New card front"
        placeholder="Front"
        value={front}
        onChange={(e) => setFront(e.target.value)}
      />
      <input
        aria-label="New card back"
        placeholder="Back"
        value={back}
        onChange={(e) => setBack(e.target.value)}
      />
      <button type="button" disabled={!canAdd} onClick={submit}>
        {busy ? 'Adding…' : 'Add card'}
      </button>
    </div>
  );
}
