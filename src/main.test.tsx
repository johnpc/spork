import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the React DOM renderer so importing main.tsx doesn't touch a real root.
const render = vi.fn();
const createRoot = vi.fn(() => ({ render, unmount: vi.fn() }));
vi.mock('react-dom/client', () => ({ createRoot, default: { createRoot } }));

// Importing main triggers Amplify.configure via ./lib/amplify — stub it.
vi.mock('./lib/amplify', () => ({ outputs: {} }));

// main.tsx also kicks off PWA service-worker registration — stub it out.
const registerServiceWorker = vi.fn();
vi.mock('./lib/registerServiceWorker', () => ({ registerServiceWorker }));

describe('main entrypoint', () => {
  beforeEach(() => {
    vi.resetModules();
    render.mockClear();
    createRoot.mockClear();
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    document.getElementById('root')?.remove();
  });

  it('mounts the App into the #root container', async () => {
    await import('./main');
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    expect(render).toHaveBeenCalledTimes(1);
    expect(registerServiceWorker).toHaveBeenCalledTimes(1);
  }, 20000);
});
