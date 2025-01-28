import { defineProject, mergeConfig } from 'vitest/config';
import defaultConfig from '../../vitest.config';

export default mergeConfig(
  defaultConfig,
  defineProject({
    test: {
      setupFiles: './vitest.setup.ts',
    },
  }),
);
