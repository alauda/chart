import { Story, Meta } from '@storybook/html';
import { timeFormat } from 'd3';

import { barData } from './data';

import { Chart } from '@alauda/chart';

import '../src/theme/default.scss';

export default {
  title: 'BaseBar',
} as Meta;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: Story = () => {
  setTimeout(() => {
    Chart({
      container: '#baseBar',
      type: 'bar',
      // rotated: true,
      title: {
        text: '柱状图',
      },
      tooltip: {},
      seriesOption: {
        // stack: true,
        // radius: 5,
        // bandwidth: 10,
      },
      data: barData,
      xAxis: {
        // type: ScaleType.TIME,
        tickFormatter: () => timeFormat('%H:%M'),
      },
    });
  }, 0);
  return `
  <div style="width: 500px; height: 250px">
  <div style="width: 100%; height: 250px" id="baseBar"></div>
  </div>`;
};

export const BaseBar = Template.bind({});
