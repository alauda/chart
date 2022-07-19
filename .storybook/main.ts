import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

export const stories = [
  '../stories/**/*.stories.mdx',
  '../stories/**/*.stories.@(js|jsx|ts|tsx)',
];

export const addons = [
  '@storybook/addon-links',
  '@storybook/addon-essentials',
  '@storybook/preset-scss',
];

export const core = {
  builder: 'webpack5',
};

export const features = {
  babelModeV7: true,
};

export function webpackFinal(config: Configuration) {
  config.resolve!.plugins = [
    // @ts-expect-error
    ...(config.resolve.plugins || []),
    // @ts-expect-error
    new TsconfigPathsPlugin(),
  ];
  return config;
}
