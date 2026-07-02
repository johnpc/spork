import { useMediaUrl } from '../../lib/useMediaUrl';
import { AudioButton } from '../shell/AudioButton';
import type { CardRecord } from '../../lib/dataClient';
import type { Choices } from './buildChoices';

interface StudyCardProps {
  card: CardRecord;
  choices: Choices;
  /** 'front' = prompt with front, recall back; 'back' = prompt with back. */
  direction: 'front' | 'back';
  /** The option the user picked, or null before answering. */
  picked: string | null;
  onAnswer: (choice: string) => void;
  onNext: () => void;
}

/** One multiple-choice flashcard: the prompt face (+image), four options, and
 * auto-graded feedback. The image shows on the prompt; the audio + hint/example
 * reveal once answered. No self-rating — the pick drives the SM-2 grade. */
export function StudyCard({ card, choices, direction, picked, onAnswer, onNext }: StudyCardProps) {
  const imageUrl = useMediaUrl(card.imagePath);
  const prompt = direction === 'front' ? card.front : card.back;
  const answered = picked !== null;

  const optionClass = (option: string): string => {
    if (!answered) return 'study-opt';
    if (option === choices.answer) return 'study-opt study-opt--correct';
    if (option === picked) return 'study-opt study-opt--wrong';
    return 'study-opt study-opt--dim';
  };

  return (
    <div className="study-card" data-testid="study-card">
      {imageUrl && <img className="study-card__img" src={imageUrl} alt="" />}
      <p className="fs-card-face study-card__front">{prompt}</p>

      <div className="study-card__options" data-testid="study-options">
        {choices.options.map((option) => (
          <button
            key={option}
            type="button"
            className={optionClass(option)}
            data-testid="study-opt"
            disabled={answered}
            onClick={() => onAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <div className="study-card__after" data-testid="study-after">
          {card.hint && <p className="fs-muted study-card__hint">{card.hint}</p>}
          {card.example && <p className="study-card__example">{card.example}</p>}
          <AudioButton audioPath={card.audioPath} />
          <button
            type="button"
            className="study-card__reveal"
            data-testid="study-next"
            onClick={onNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
