import { useMediaUrl } from '../../lib/useMediaUrl';

/**
 * Lazy audio player for a card's pronunciation clip. Renders the native control
 * immediately and uses `preload="none"` so the ~5KB MP3 is fetched only when the
 * user hits play — the control feels instant instead of waiting on a presign +
 * download round-trip. Renders nothing until the S3 key resolves to a URL.
 */
export function AudioButton({ audioPath }: { audioPath?: string | null }) {
  const audioUrl = useMediaUrl(audioPath);
  if (!audioUrl) return null;
  return (
    <audio
      className="audio-btn"
      controls
      preload="none"
      src={audioUrl}
      data-testid="card-media-audio"
    >
      <track kind="captions" />
    </audio>
  );
}
