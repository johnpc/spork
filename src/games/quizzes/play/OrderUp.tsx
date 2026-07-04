import { useMemo } from 'react';
import type { RendererProps } from './renderers';
import { orderItems, placedLabel, revealItems } from './orderUpItems';
import './orderUp.css';

/**
 * ORDER_UP renderer — arrange items into the correct sequence. Items are shown
 * as clickable buttons in an order that hides the answer; the player clicks them
 * in the order they believe is right, calling attempt(id). SEQUENCE scoring only
 * counts the NEXT-expected orderIndex, so a wrong click misses (no state change)
 * and a correct one flips the button to its "placed" role. It consumes the shared
 * { answers, found, attempt } contract — the engine stays mode-agnostic.
 */
export function OrderUp({ answers, found, attempt, status }: RendererProps) {
  const items = useMemo(() => orderItems(answers), [answers]);
  const done = status === 'done';
  const revealList = useMemo(() => revealItems(answers, found), [answers, found]);

  if (done) {
    return (
      <div className="order-up" data-testid="order-up">
        <p className="sp-muted order-up__progress" data-testid="order-up-progress">
          Correct order:
        </p>
        <ol className="order-up__reveal" data-testid="orderup-reveal">
          {revealList.map((item, idx) => (
            <li
              key={item.id}
              className={
                item.found
                  ? 'order-up__reveal-item'
                  : 'order-up__reveal-item order-up__reveal-item--missed'
              }
            >
              <span className="order-up__rank">{idx + 1}</span>
              <span className="order-up__label">{item.display}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="order-up" data-testid="order-up">
      <p className="sp-muted order-up__progress" data-testid="order-up-progress">
        {placedLabel(found.size, items.length)}
      </p>
      <ol className="order-up__list">
        {items.map((item) => {
          const placed = found.has(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={placed ? 'order-up__item order-up__item--placed' : 'order-up__item'}
                data-testid={placed ? 'order-up-placed' : 'order-up-item'}
                data-id={item.id}
                disabled={placed}
                onClick={() => attempt(item.id)}
              >
                {placed && <span className="order-up__rank">{item.orderIndex + 1}</span>}
                <span className="order-up__label">{item.display}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
