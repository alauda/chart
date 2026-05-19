import { Story, Meta, StoryObj } from '@storybook/html';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Bar',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'bar',
          values: [
            { x: 'A', y: 10 },
            { x: 'B', y: 20 },
            { x: 'C', y: 15 },
            { x: 'D', y: 25 },
          ],
        },
      ],
      options: {
        title: { text: '基础柱状图' },
        scale: {
          x: {
            time: false,
          },
        },
        bar: {
          barWidth: 50,
          itemStyle: {
            borderRadius: 10,
          },
        },
      },
    });
    chart.bar();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicBar: StoryObj = Template.bind({});

const GroupedBarTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'bar1',
          values: [
            { x: 'A', y: 10 },
            { x: 'B', y: 20 },
            { x: 'C', y: 15 },
          ],
        },
        {
          name: 'bar2',
          values: [
            { x: 'A', y: 15 },
            { x: 'B', y: 25 },
            { x: 'C', y: 20 },
          ],
        },
        {
          name: 'bar3',
          values: [
            { x: 'A', y: 8 },
            { x: 'B', y: 12 },
            { x: 'C', y: 10 },
          ],
        },
      ],
      options: {
        title: { text: '分组柱状图' },
        scale: {
          x: {
            time: false,
          },
        },
        bar: {
          barWidth: 10,
          itemStyle: {
            borderRadius: 1,
          },
          adjust: {
            type: 'group',
            marginRatio: 0.2,
          },
        },
        legend: {
          position: 'top-right',
        },
      },
    });
    chart.bar();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const GroupedBarChart: StoryObj = GroupedBarTemplate.bind({});

const StackedBarTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'bar1',
          values: [
            { x: 'A', y: 10 },
            { x: 'B', y: 20 },
            { x: 'C', y: 15 },
          ],
        },
        {
          name: 'bar2',
          values: [
            { x: 'A', y: 15 },
            { x: 'B', y: 25 },
            { x: 'C', y: 20 },
          ],
        },
        {
          name: 'bar3',
          values: [
            { x: 'A', y: 8 },
            { x: 'B', y: 12 },
            { x: 'C', y: 10 },
          ],
        },
      ],
      options: {
        title: { text: '堆叠柱状图' },
        scale: {
          x: {
            time: false,
          },
        },
        bar: {
          barWidth: 10,
          itemStyle: {
            borderRadius: 1,
          },
          adjust: {
            type: 'stack',
          },
        },
        legend: {
          position: 'top-right',
        },
      },
    });
    chart.bar();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const StackedBarChart: StoryObj = StackedBarTemplate.bind({});

const HorizontalBarTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'bar',
          values: [
            { x: 'A', y: 10 },
            { x: 'B', y: 20 },
            { x: 'C', y: 15 },
            { x: 'D', y: 25 },
          ],
        },
      ],
      options: {
        title: { text: '水平柱状图' },
        scale: {
          x: {
            time: false,
          },
        },
        coordinate: {
          transposed: true,
        },
        bar: {
          barWidth: 10,
          itemStyle: {
            borderRadius: 1,
          },
        },
      },
    });
    chart.bar();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const HorizontalBarChart: StoryObj = HorizontalBarTemplate.bind({});

const CustomColorTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'bar1',
          color: 'rgb(255, 99, 132)',
          values: [
            { x: 'A', y: 10 },
            { x: 'B', y: 20 },
            { x: 'C', y: 15 },
          ],
        },
        {
          name: 'bar2',
          color: 'rgb(54, 162, 235)',
          values: [
            { x: 'A', y: 15 },
            { x: 'B', y: 25 },
            { x: 'C', y: 20 },
          ],
        },
      ],
      options: {
        title: { text: '自定义颜色的柱状图' },
        scale: {
          x: {
            time: false,
          },
        },
        bar: {
          barWidth: 10,
          itemStyle: {
            borderRadius: 1,
          },
          adjust: {
            type: 'group',
          },
        },
        legend: {
          position: 'top-right',
        },
      },
    });
    chart.bar();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BarWithCustomColors: StoryObj = CustomColorTemplate.bind({});
