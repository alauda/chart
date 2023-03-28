import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { dealWithTime, generateTime, generateY } from './utilt';

import { ActionType, Chart, ChartEvent } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Gauge',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  addons.getChannel().on(DARK_MODE_EVENT_NAME, (e: boolean) => {
    chart?.theme(e ? 'dark' : 'light');
  });

  setTimeout(() => {
    const destroy = document.querySelector('#destroy');
    const init = document.querySelector('#init');
    const change = document.querySelector('#change');
    const update = document.querySelector('#update');
    const total = 60;
    const step = 720;
    const start = '2023-01-31 09:00:00';
    const range1: [number, number] = [0, 100];
    const range2: [number, number] = [0, 100];
    const timeData = generateTime(start, total, step);
    let yData1 = generateY(total, range1);
    // let yData2 = generateY(total, range2);

    const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));
    // const d2 = timeData.map((x, i) => ({ x, y: yData2[i] }));
    const data = [
      {
        name: 'area1',
        // color: 'rgb(var(--aui-color-green))',
        value: d1,
      },
      // {
      //   name: 'area2',
      //   values: d2,
      // },
    ];
    const groupPieData = [
      {
        name: '部署',
        value: 50,
        color: '#006eff',
      },
    ];
    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data: groupPieData,
        options: {
          // axis: {
          //   x: {},
          // },
          // scale: {
          //   x: {},
          //   y: {},
          // },
          // tooltip: false,
        },
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart', data));
      chart.gauge({
        // outerRadius: 60,
        // innerRadius: 0.2,
        colors: [
          [0.8, '#73BF69'],
          [0.1, '#EAB839'],
          [0.1, 'red'],
        ],
        // label: {
        //   text: '<div>1000</div>',
        // },
      });
      chart.interaction('element-active');
      chart.render();
    }
  });

  return `
  <div style="width: 100%; height: 200px; display: flex;">
  <div  style="width:100%;height:100%;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
    <div class="chart"></div>
  </div>
</div>
  `;
};

export const Gauge = Template.bind({});
