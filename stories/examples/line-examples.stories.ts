import { Story, Meta, StoryObj } from '@storybook/html';

import { dealWithTime, generateData } from '../utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Line',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'line',
          floatValues: d1,
        },
      ],
      options: {
        title: { text: '基础折线图' },
        line: {
          width: 2,
          alpha: 0.8,
        },
        tooltip: {
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.line();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicLine: StoryObj = Template.bind({});

const MultiLineTemplate: Story = () => {
  setTimeout(() => {
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    const d2 = generateData('2023-01-31 09:00:00', 60, 60, [5, 15]);
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'line1',
          floatValues: d1,
        },
        {
          name: 'line2',
          floatValues: d2,
        },
      ],
      options: {
        title: { text: '多系列折线图' },
        line: {
          width: 2,
          alpha: 0.8,
        },
        legend: {
          position: 'top-right',
        },
        tooltip: {
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.line();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const MultiLineChart: StoryObj = MultiLineTemplate.bind({});

const StepLineTemplate: Story = () => {
  setTimeout(() => {
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'line',
          floatValues: d1,
        },
      ],
      options: {
        title: { text: '阶梯线图' },
        line: {
          step: 'start',
          width: 2,
          alpha: 0.8,
        },
        tooltip: {
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    chart.line();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const StepLineChart: StoryObj = StepLineTemplate.bind({});
