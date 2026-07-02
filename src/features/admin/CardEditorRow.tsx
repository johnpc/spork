import { useState } from 'react';
import type { CardRecord } from '../../lib/dataClient';
import type { CardInput } from './adminCardApi';
import { CardMedia } from './CardMedia';

interface Props {
  card: CardRecord;
  onSave: (input: CardInput) => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onRegenerate: (kind: 'image' | 'audio') => void;
}

/** One editable card row: inline front/back fields, save/delete/reorder/regen. */
export function CardEditorRow({ card, onSave, onDelete, onMove, onRegenerate }: Props) {
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const dirty = front !== card.front || back !== card.back;

  return (
    <li className="card-edit" data-testid="card-edit">
      <CardMedia imagePath={card.imagePath} audioPath={card.audioPath} />
      <div className="card-edit__fields">
        <input
          aria-label="Front"
          className="card-edit__input"
          value={front}
          onChange={(e) => setFront(e.target.value)}
        />
        <input
          aria-label="Back"
          className="card-edit__input"
          value={back}
          onChange={(e) => setBack(e.target.value)}
        />
      </div>
      <div className="card-edit__actions">
        <button type="button" aria-label="Move up" onClick={() => onMove('up')}>
          ↑
        </button>
        <button type="button" aria-label="Move down" onClick={() => onMove('down')}>
          ↓
        </button>
        <button type="button" disabled={!dirty} onClick={() => onSave({ front, back })}>
          Save
        </button>
        <button type="button" aria-label="Regenerate image" onClick={() => onRegenerate('image')}>
          🖼
        </button>
        <button type="button" aria-label="Regenerate audio" onClick={() => onRegenerate('audio')}>
          🔊
        </button>
        <button type="button" className="card-edit__del" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}
