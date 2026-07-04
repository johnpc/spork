import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BeePlayArea } from './BeePlayArea';

describe('BeePlayArea', () => {
  const base = {
    current: '',
    found: [],
    score: 0,
    answersTotal: 10,
    centerLetter: 'a',
    outerOrder: ['b', 'c', 'd', 'e', 'f', 'g'],
    pangrams: [],
    answers: ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr', 'stu', 'vwx', 'yz', 'pangram'],
    lastResult: null,
    onType: vi.fn(),
    onBackspace: vi.fn(),
    onShuffle: vi.fn(),
    onSubmit: vi.fn(),
    onGiveUp: vi.fn(),
  };

  it('displays the current input', () => {
    render(<BeePlayArea {...base} current="abc" />);
    expect(screen.getByTestId('bee-input')).toHaveTextContent('ABC');
  });

  it('shows found count and score', () => {
    render(<BeePlayArea {...base} found={['abc', 'def']} score={5} answersTotal={10} />);
    expect(screen.getByText(/Found: 2 \/ 10/)).toBeInTheDocument();
    expect(screen.getByTestId('bee-score')).toHaveTextContent('Score: 5');
  });

  it('renders the hive with correct letters', () => {
    render(<BeePlayArea {...base} />);
    expect(screen.getByTestId('hex-a')).toBeInTheDocument();
    expect(screen.getByTestId('hex-b')).toBeInTheDocument();
  });

  it('shows error message when lastResult is an error', () => {
    render(<BeePlayArea {...base} lastResult={{ ok: false, reason: 'too-short' }} />);
    expect(screen.getByTestId('bee-error')).toHaveTextContent('Too short');
    expect(screen.getByTestId('bee-error')).toHaveAttribute('role', 'alert');
  });

  it('shows success message when lastResult is ok', () => {
    render(<BeePlayArea {...base} lastResult={{ ok: true, reason: '' }} />);
    expect(screen.getByTestId('bee-success')).toHaveTextContent('Nice!');
    expect(screen.getByTestId('bee-success')).toHaveAttribute('role', 'status');
  });

  it('disables delete and enter when current is empty', () => {
    render(<BeePlayArea {...base} current="" />);
    expect(screen.getByTestId('bee-delete')).toBeDisabled();
    expect(screen.getByTestId('bee-enter')).toBeDisabled();
  });

  it('enables delete and enter when current has text', () => {
    render(<BeePlayArea {...base} current="abc" />);
    expect(screen.getByTestId('bee-delete')).not.toBeDisabled();
    expect(screen.getByTestId('bee-enter')).not.toBeDisabled();
  });

  it('calls onBackspace when delete is clicked', () => {
    const onBackspace = vi.fn();
    render(<BeePlayArea {...base} current="abc" onBackspace={onBackspace} />);
    fireEvent.click(screen.getByTestId('bee-delete'));
    expect(onBackspace).toHaveBeenCalled();
  });

  it('calls onShuffle when shuffle is clicked', () => {
    const onShuffle = vi.fn();
    render(<BeePlayArea {...base} onShuffle={onShuffle} />);
    fireEvent.click(screen.getByTestId('bee-shuffle'));
    expect(onShuffle).toHaveBeenCalled();
  });

  it('calls onSubmit when enter is clicked', () => {
    const onSubmit = vi.fn();
    render(<BeePlayArea {...base} current="abc" onSubmit={onSubmit} />);
    fireEvent.click(screen.getByTestId('bee-enter'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('displays found words in uppercase', () => {
    render(<BeePlayArea {...base} found={['abc', 'def']} />);
    const words = screen.getAllByTestId('bee-found-word');
    expect(words).toHaveLength(2);
    expect(words[0]).toHaveTextContent('ABC');
    expect(words[1]).toHaveTextContent('DEF');
  });

  it('marks pangrams with an emoji', () => {
    render(<BeePlayArea {...base} found={['abc', 'pangram']} pangrams={['pangram']} />);
    const words = screen.getAllByTestId('bee-found-word');
    expect(words[0]).toHaveTextContent('ABC');
    expect(words[0]).not.toHaveTextContent('🎉');
    expect(words[1]).toHaveTextContent('PANGRAM 🎉');
  });

  it('shows give-up button before reveal', () => {
    render(<BeePlayArea {...base} />);
    expect(screen.getByTestId('bee-giveup')).toBeInTheDocument();
    expect(screen.queryByTestId('bee-reveal')).not.toBeInTheDocument();
  });

  it('calls onGiveUp and shows reveal when give-up is clicked', () => {
    const onGiveUp = vi.fn();
    render(
      <BeePlayArea
        {...base}
        answers={['abc', 'def', 'ghi']}
        found={['abc']}
        pangrams={[]}
        onGiveUp={onGiveUp}
      />,
    );
    fireEvent.click(screen.getByTestId('bee-giveup'));
    expect(onGiveUp).toHaveBeenCalled();
    expect(screen.getByTestId('bee-reveal')).toBeInTheDocument();
    expect(screen.queryByTestId('bee-giveup')).not.toBeInTheDocument();
  });

  it('hides input area after reveal', () => {
    render(<BeePlayArea {...base} answers={['abc', 'def']} found={['abc']} pangrams={[]} />);
    fireEvent.click(screen.getByTestId('bee-giveup'));
    expect(screen.queryByTestId('bee-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bee-delete')).not.toBeInTheDocument();
  });
});
