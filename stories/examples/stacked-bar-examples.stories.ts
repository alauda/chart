import { Story, Meta, StoryObj } from '@storybook/html';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Examples/StackedBar',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  setTimeout(() => {
    chart = new Chart({
      container: '.chart',
      data: [
        {
          name: 'Running',
          color: '#00C261',
          values: [
            { x: 'deployments', y: 2 },
            { x: 'statefulsets', y: 1 },
            { x: 'daemonset', y: 1 },
          ],
          stack: 'data',
        },
        {
          name: 'Progressing',
          color: '#007AF5',
          values: [
            { x: 'deployments', y: 1 },
            { x: 'statefulsets', y: 1 },
            { x: 'daemonset', y: 1 },
          ],
          stack: 'data',
        },
        {
          name: 'Stopped',
          color: '#96989B',
          values: [
            { x: 'deployments', y: 1 },
            { x: 'statefulsets', y: 1 },
            { x: 'daemonset', y: 0 },
          ],
          stack: 'data',
        },
        {
          name: 'Firing',
          color: '#EB0027',
          values: [
            { x: 'deployments', y: 1 },
            { x: 'statefulsets', y: 1 },
            { x: 'daemonset', y: 1 },
          ],
          stack: 'alert',
        },
      ],
      options: {
        title: { text: '多组堆叠柱状图' },
        axis: {
          x: {
            categories: ['deployments', 'statefulsets', 'daemonset'],
          },
        },
        barStacked: {
          barWidth: 60,
          itemStyle: {
            borderRadius: 20,
          },
        },
        legend: {
          position: 'top-right',
        },
      },
    });
    chart.barStacked();
    chart.render();
  });

  return `
    <div style="width: 100%; height: 400px;">
      <div class="chart" style="width: 100%; height: 100%;"></div>
    </div>
  `;
};

export const BasicStackedBar: StoryObj = Template.bind({});
