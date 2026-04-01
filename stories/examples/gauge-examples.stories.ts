import { Story, Meta, StoryObj } from '@storybook/html';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Gauge',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'value',
          value: 75,
        },
      ],
      options: {
        title: { text: '基础仪表盘' },
        gauge: {
          max: 100,
        },
      },
    });
    chart.gauge();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicGauge: StoryObj = Template.bind({});

const ColorRangeTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'value',
          value: 65,
        },
      ],
      options: {
        title: { text: '自定义颜色范围的仪表盘' },
        gauge: {
          max: 100,
          colors: [
            [60, '#73BF69'],
            [80, '#EAB839'],
            [100, '#EB0027'],
          ],
        },
      },
    });
    chart.gauge();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const GaugeWithColorRange: StoryObj = ColorRangeTemplate.bind({});

const CenterTextTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'value',
          value: 85,
        },
      ],
      options: {
        title: { text: '显示中心文本的仪表盘' },
        gauge: {
          max: 100,
          label: {
            text: '{value}%',
            description: '使用率',
          },
        },
      },
    });
    chart.gauge();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const GaugeWithCenterText: StoryObj = CenterTextTemplate.bind({});
