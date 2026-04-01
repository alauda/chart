import { Story, Meta, StoryObj } from '@storybook/html';

import { dealWithTime, generateData } from '../utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Point',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'point',
          floatValues: generateData('2023-01-31 09:00:00', 60, 60),
        },
         {
          name: 'point1',
          floatValues: generateData('2023-01-31 09:00:00', 60, 60),
        },
      ],
      options: {
        title: { text: '基础散点图' },
        point: {
          pointSize: 4,
        },
        tooltip: {
          titleFormatter: title =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.point();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicPoint: StoryObj = Template.bind({});
