import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  beforeEach(() => {
    document.title = 'initial';
  });

  it('appends the base brand to a page title', () => {
    renderHook(() => useDocumentTitle('Chess Attack'));
    expect(document.title).toBe('Chess Attack · Spork');
  });

  it('uses the bare brand without a separator for the base title', () => {
    renderHook(() => useDocumentTitle('Spork'));
    expect(document.title).toBe('Spork');
  });

  it('restores the previous title on unmount', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Worldle'));
    expect(document.title).toBe('Worldle · Spork');
    unmount();
    expect(document.title).toBe('initial');
  });

  it('leaves the title untouched for a falsy value (e.g. still loading)', () => {
    renderHook(() => useDocumentTitle(undefined));
    expect(document.title).toBe('initial');
  });
});
