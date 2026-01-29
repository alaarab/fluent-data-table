import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
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
