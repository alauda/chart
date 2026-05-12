import { Story, Meta } from '@storybook/html';

import { generateTime, generateY } from './utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Theme/Switch',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    const total = 60;
    const step = 720;
    const start = '2023-01-31 09:00:00';
    const range1: [number, number] = [0, 100];
    const timeData = generateTime(start, total, step);
    const yData1 = generateY(total, range1);

    const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));

    chart = new Chart({
      container: '.chart-area',
      data: [
        {
          name: 'area1',
          floatValues: [timeData, d1.map(item => item.y)],
        },
      ],
      options: {
        title: { text: 'Theme Switch Demo' },
        legend: {
          position: 'bottom-left',
        },
        axis: {
          x: {},
          y: {},
        },
      },
    });

    chart.line();
    chart.render();

    // Light button
    document.querySelector('#btn-light').addEventListener('click', () => {
      chart?.theme('light');
    });

    // Dark button
    document.querySelector('#btn-dark').addEventListener('click', () => {
      chart?.theme('dark');
    });

    // System button
    document.querySelector('#btn-system').addEventListener('click', () => {
      chart?.theme('system');
    });
  });

  return `
  <div style="margin-bottom: 12px;">
    <button id="btn-light">Light</button>
    <button id="btn-dark">Dark</button>
    <button id="btn-system">System</button>
  </div>
  <div style="width: 100%; height: 300px; padding: 20px 16px; box-sizing: border-box;">
    <div class="chart-area"></div>
  </div>
  `;
};

export const ThemeSwitch = Template.bind({});
