/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // chess.js uses BigInt literals (0n). The default legacy-plugin target is
  // es2020, whose configured browser floor (chrome64/safari12) predates BigInt,
  // so esbuild refuses to transpile it. Target browsers that support BigInt
  // (all evergreen since ~2020) for the modern build; the legacy plugin still
  // emits an ES5 fallback bundle for older ones.
  build: {
    target: ['es2020', 'chrome67', 'safari14', 'firefox68', 'edge79'],
    rollupOptions: {
      output: {
        // Split the heavy vendors into their own chunks. They change far less
        // often than app code, so they stay cached across deploys, and the
        // browser can parse them in parallel — the ~1.5MB single chunk (369KB
        // gzip, mostly unused at first paint) was the main drag on FCP/LCP.
        manualChunks: {
          amplify: ['aws-amplify'],
          ionic: ['@ionic/react', '@ionic/react-router', 'ionicons'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  plugins: [react(), legacy({ modernTargets: 'chrome>=67, safari>=14, firefox>=68, edge>=79' })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Generous timeout so async hook/waitFor tests don't flake under the CPU
    // contention of the pre-commit hook (build + tests running together).
    testTimeout: 15000,
    // Acceptance tests live in e2e/ and run under Playwright, not Vitest.
    // .features-gen/ holds Playwright-BDD's generated specs — never Vitest's.
    // `.claude/worktrees` holds isolated agent worktrees — each carries its own
    // copy of the suite; without this they'd be collected twice and pollute runs.
    exclude: ['node_modules', 'dist', 'e2e', '.features-gen', '.idea', '.git', '.cache', '.claude'],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      // Measure EVERY source + amplify LOGIC file, even untested ones.
      all: true,
      include: ['src/**/*.{ts,tsx}', 'amplify/**/*.ts'],
      // Excluded: tests, type decls, setup — AND declarative amplify files
      // (resource/backend config, fixture data) + the seed runner entrypoint
      // (side-effects on import; its logic lives in tested helpers). Backend
      // LOGIC (seed helpers, future functions) IS measured — fix low coverage
      // with tests, never an exclusion.
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.d.ts',
        'src/vite-env.d.ts',
        'src/setupTests.ts',
        'amplify/**/resource.ts',
        'amplify/backend.ts',
        'amplify/seed/fixtures/**',
        // Fixture DATA (records, not logic): seed fixtures + generated game
        // templates like the reconciled world-countries map answer set.
        'amplify/quizgen/fixtures/**',
        'amplify/dailyingest/fixtures/**',
        // Seed/maintenance runner entrypoints: side-effecting main() scripts
        // (sign in, mutate, exit) with no unit-testable surface — their logic
        // lives in tested helpers (seedReference, resizeImage). Run manually.
        'amplify/seed/seed.ts',
        'amplify/seed/seedCategories.ts',
        'amplify/seed/backfillMedia.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
