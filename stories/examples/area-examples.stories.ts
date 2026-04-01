import { Story, Meta, StoryObj } from '@storybook/html';

import { dealWithTime, generateData } from '../utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Area',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'area',
          floatValues: d1,
        },
      ],
      options: {
        title: { text: '基础面积图' },
        area: {
          alpha: 0.3,
        },
        tooltip: {
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.area();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicArea: StoryObj = Template.bind({});

const LineAreaTemplate: Story = () => {
  setTimeout(() => {
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    const d2 = generateData('2023-01-31 09:00:00', 60, 60);
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'area',
          floatValues: d1,
        },
         {
          name: 'line',
          floatValues: d2,
        },
      ],
      options: {
        title: { text: '面积图与折线图结合' },
        line: {
          width: 2,
          alpha: 0.8,
        },
        area: {
          alpha: 0.3,
        },
        tooltip: {
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.area().map('area');
    chart.line().map('line');
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const LineAreaChart: StoryObj = LineAreaTemplate.bind({});
