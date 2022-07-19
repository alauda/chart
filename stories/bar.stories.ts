import { Story, Meta } from '@storybook/html';

import { groupBarData } from './data';

import { Chart, ScaleType } from '@alauda/chart';

import '../src/theme/default.scss';

export default {
  title: 'Bar',
} as Meta;

// More on component templates: https://storybook.js.org/docs/html/writing-stories/introduction#using-args
const Template: Story = () => {
  setTimeout(() => {
    Chart({
      container: '#barChart',
      type: 'bar',
      // offset: {
      //   x: 220,
      //   y: 40,
      // },
      rotated: true,
      title: {
        text: '柱状图',
      },
      legend: {},
      tooltip: {
        trigger: 'axis',
      },
      seriesOption: {
        isGroup: true,
        stack: true,
        radius: 5,
        closeRadiusLadder: true,
        bandwidth: 10,
      },
      data: groupBarData,
      xAxis: {
        type: ScaleType.ORDINAL,
      },
    });
  }, 0);
  return `
  <div style="width: 100%; height: 220px" id="barChart"></div>`;
};

export const bar = Template.bind({});
