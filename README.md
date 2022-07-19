# @alauda/chart

[![GitHub Actions](https://github.com/alauda/alauda-chart/workflows/CI/badge.svg)](https://github.com/alauda/alauda-chart/actions/workflows/ci.yml)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/alauda/alauda-chart.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/alauda/alauda-chart/context:javascript)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Falauda%2Falauda-chart%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![npm](https://img.shields.io/npm/v/@alauda/chart.svg)](https://www.npmjs.com/package/@alauda/chart)
[![GitHub Release](https://img.shields.io/github/release/alauda/alauda-chart)](https://github.com/alauda/alauda-chart/releases)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/atlassian/changesets)

> Alauda Chart components by Alauda Frontend Team

## TOC <!-- omit in toc -->

- [Usage](#usage)
  - [Install](#install)
  - [API](#api)
- [Changelog](#changelog)
- [License](#license)

## Usage

### Install

```sh
# pnpm
pnpm add @alauda/chart

# yarn
yarn add @alauda/chart

# npm
npm i @alauda/chart
```

### API

```js
import { Chart } from '@alauda/chart';

Chart({
  container: document.querySelector('#chart-container'),
});
```

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [Alauda][]

[alauda]: https://www.alauda.cn/
[mit]: http://opensource.org/licenses/MIT
