import { Story, Meta, StoryObj } from '@storybook/html';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/Pie',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
        { name: 'D', value: 35 },
      ],
      options: {
        title: { text: '基础饼图' },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicPie: StoryObj = Template.bind({});

const DonutTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
        { name: 'D', value: 35 },
      ],
      options: {
        title: { text: '环形图' },
        pie: {
          innerRadius: 0.6,
        },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const DonutChart: StoryObj = DonutTemplate.bind({});

const LabelTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
        { name: 'D', value: 35 },
      ],
      options: {
        title: { text: '带标签的饼图' },
        pie: {
          labelLine: {
            show: true,
            labels: ['name', 'value', 'percent'],
          },
        },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const PieWithLabels: StoryObj = LabelTemplate.bind({});

const CenterTextTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
        { name: 'D', value: 35 },
      ],
      options: {
        title: { text: '带中心文本的环形图' },
        pie: {
          innerRadius: 0.6,
          label: {
            text: '总计: 100',
            description: '各部分占比',
          },
        },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const PieWithCenterText: StoryObj = CenterTextTemplate.bind({});

const CustomColorTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30, color: 'rgb(255, 99, 132)' },
        { name: 'B', value: 20, color: 'rgb(54, 162, 235)' },
        { name: 'C', value: 15, color: 'rgb(255, 205, 86)' },
        { name: 'D', value: 35, color: 'rgb(75, 192, 192)' },
      ],
      options: {
        title: { text: '自定义颜色的饼图' },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const PieWithCustomColors: StoryObj = CustomColorTemplate.bind({});

const RoundedTemplate: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        { name: 'A', value: 30 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 },
        { name: 'D', value: 35 },
      ],
      options: {
        title: { text: '圆角饼图' },
        pie: {
          itemStyle: {
            borderRadius: 8,
            borderWidth: 2,
          },
        },
      },
    });
    chart.pie();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px; display: flex; justify-content: center; align-items: center;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const PieWithRoundedCorners: StoryObj = RoundedTemplate.bind({});
