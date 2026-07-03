import { useCopy } from '../../games/shared/daily/useCopy';

/** "Share my day" button on Home — shares the multi-game scorecard (built by
 * buildDaySummaryText). Uses the native share sheet when available (mobile),
 * else copies to the clipboard and flashes "Copied!". Renders nothing when
 * there's no finished game yet (empty text). */
export function ShareDayButton({ text }: { text: string }) {
  const { copied, copy } = useCopy();
  if (!text) return null;

  const onShare = () => {
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
    if (typeof nav.share === 'function') {
      void nav.share({ text }).catch(() => copy(text));
    } else {
      copy(text);
    }
  };

  return (
    <button
      type="button"
      className="home-hero__share"
      data-testid="share-day"
      onClick={onShare}
      title={text}
    >
      {copied ? 'Copied!' : 'Share my day'}
    </button>
  );
}
