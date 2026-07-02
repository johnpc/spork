import { Link } from 'react-router-dom';
import { useDueSummary } from './useDueSummary';
import './duetoday.css';

/** "Due today" panel atop My Decks: total cards due across all saved decks +
 * per-deck breakdown with a quick Study link. Hidden when nothing is due. */
export function DueTodayPanel() {
  const { summary, isLoading } = useDueSummary();
  if (isLoading || !summary || summary.total === 0) return null;
  return (
    <section className="due-today" data-testid="due-today">
      <p className="due-today__count">
        <span className="due-today__num">{summary.total}</span>
        {summary.total === 1 ? ' card due' : ' cards due'} across {summary.decks.length}{' '}
        {summary.decks.length === 1 ? 'deck' : 'decks'}
      </p>
      <ul className="due-today__decks">
        {summary.decks.map((d) => (
          <li key={d.deckId} className="due-today__row" data-testid="due-deck">
            <Link to={`/decks/${d.deckId}/study`} className="due-today__link">
              <span className="due-today__topic">{d.topic}</span>
              <span className="due-today__badge">{d.dueCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
