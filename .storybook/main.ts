import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      // Disable Vite HMR (Storybook will still rebuild on file changes, but the browser won't hot-patch).
      // This is a stability tradeoff to avoid repeated SIGKILLs / connection flapping under memory pressure.
      server: {
        hmr: false,
      },
      css: {
        modules: {
          localsConvention: 'camelCase',
        },
        preprocessorOptions: {
          scss: {
            api: 'modern-compiler',
          },
        },
      },
    });
  },
};

export default config;
