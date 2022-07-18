import { Story, Meta } from '@storybook/html';
import { timeFormat } from 'd3';

import { Chart, AChart } from '../src';
import { ScaleType } from '../src/types';

import { ScatterData } from './data';

import '../src/theme/default.scss';
import { round } from 'lodash';

export default {
  title: 'Scatter',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    const chart: AChart = Chart({
      container: '#chart',
      type: 'scatter',
      title: {
        text: '气泡-散点图',
      },
      legend: {},
      seriesOption: {
        type: 'bubble',
        size: 3,
        minSize: 10,
        maxSize: 30,
      },
      data: ScatterData,
      yAxis: {
        tickFormatter: duration => {
          let d = duration / 1000;
          let units = 'ms';
          if (d >= 1000) {
            units = 's';
            d /= 1000;
          }
          return `${round(d, 2)}${units}`;
        },
      },
      xAxis: {
        type: ScaleType.TIME,
        tickFormatter: () => timeFormat('%m-%d %H:%M'),
      },
      tooltip: {
        trigger: 'item',
        // titleFormatter: (name: Date | number | string) =>
        //   `<div>${new Date(name)}</div>`,
        // itemFormatter: (values: TooltipContextItem[]) =>
        //   `<div>${JSON.stringify(values)}</div>`,
        // sort: (a, b) => a.y - b.y,
      },
    });
  });
  return `<div>
    <div style="width: 100%; height: 200px;" id="chart"></div>
  </div>`;
};

export const scatter = Template.bind({});
