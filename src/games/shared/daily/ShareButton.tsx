import { useCopy } from './useCopy';
import { buildShareText, type ShareInput } from './shareResult';

/** "Share result" button on a daily recap. Uses the native share sheet when
 * available (mobile), otherwise copies the spoiler-free brag string to the
 * clipboard and flashes "Copied!". The text is built by buildShareText. */
export function ShareButton(props: ShareInput) {
  const { copied, copy } = useCopy();
  const text = buildShareText(props);

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
      className="share-result"
      data-testid="share-result"
      onClick={onShare}
      title={text}
    >
      {copied ? 'Copied!' : 'Share result'}
    </button>
  );
}
