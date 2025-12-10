import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'StackedBar',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  addons.getChannel().on(DARK_MODE_EVENT_NAME, (e: boolean) => {
    chart?.theme(e ? 'dark' : 'light');
  });

  setTimeout(() => {
    // const groupPieData = [
    //   {
    //     name: '部署',
    //     value: 7038600,
    //     color: '#999',
    //   },

    //   {
    //     name: '有状态',
    //     value: 7038360,
    //     color: '#0abf5b',
    //   },
    //   {
    //     name: '守护',
    //     value: 7039320,
    //     color: '#006eff',
    //   },
    //   {
    //     name: 'sss',
    //     value: 52186903,
    //     color: '#999',
    //   },
    // ];

    const data = [
      {
        name: 'Running',
        color: '#00C261',
        values: [
          {
            y: 2,
            index: 0,
          },
          {
            y: 1,
            index: 1,
          },
          {
            y: 1,
            index: 2,
          },
        ],
        stack: 'data',
      },
      {
        name: 'Progressing',
        color: '#007AF5',
        values: [
          {
            y: 1,
            index: 0,
          },
          {
            y: 1,
            index: 1,
          },
          {
            y: 1,
            index: 2,
          },
        ],
        stack: 'data',
      },
      {
        name: 'Stopped',
        color: '#96989B',
        borderWidth: 0,
        values: [
          {
            y: 1,
            index: 0,
          },
          {
            y: 1,
            index: 1,
          },
          {
            y: 0,
            index: 2,
          },
        ],
        stack: 'data',
      },
      {
        name: 'Firing',
        color: '#EB0027',
        borderWidth: 0,
        values: [
          {
            y: 1,
          },
          {
            y: 1,
          },
          {
            y: 1,
          },
        ],
        stack: 'alert',
      },
    ];

    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data,
        options: {
          axis: {
            x: {
              categories: ['deployments', 'statefulsets', 'daemonset'],
            },
          },
          barStacked: {
            barWidth: 60,
          },
          // legend: {
          //   position: 'bottom-left'
          // },
          // tooltip: true,
        },
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart', data));
      chart.barStacked();
      // chart.interaction('element-active');
      chart.render();
    }
  });

  return `
  <div class="pie-chart">
    <div style="width: 100%; height: 100%; display: flex;">
      <div  style="width:100%;height:500px;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
        <div class="chart"></div>
      </div>
  </div>
</div>
  `;
};

export const StackedBar = Template.bind({});
