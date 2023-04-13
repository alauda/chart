import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { dealWithTime, generateTime, generateY } from './utilt';

import { ActionType, Chart, ChartEvent } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Demo',
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
    // const range2: [number, number] = [0, 100];
    const timeData = generateTime(start, total, step);
    let yData1 = generateY(total, range1);
    // let yData2 = generateY(total, range2);

    const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));
    // const d2 = timeData.map((x, i) => ({ x, y: yData2[i] }));
    const data = [
      {
        name: 'area1',
        // color: 'rgb(var(--aui-color-green))',
        values: d1,
      },
      // {
      //   name: 'area2',
      //   values: d2,
      // },
    ];
    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data,
        options: {
          // title: { text: '1231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312' },
          // title: { text: '11', custom: true },

          //   position: 'bottom-right',
          // }
          axis: {
            x: {},
            // y: {
            //   autoSize: true,
            //   formatter: `{value}%1`,
            // },
          },
          scale: {
            x: {},
            y: {},
          },
          annotation: {
            // lineX: {
            //   data: null,
            // },
            // lineY: {
            //   data: 1,
            //   text: {
            //     content: 'lineY',
            //   },
            // },
          },
          tooltip: {
            // showTitle: false
            titleFormatter: (title: string) =>
              `${dealWithTime(new Date(Number(title) * 1000))}`,
          },
          // tooltip: false,
        },
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart-area', data));
      chart.point();
      chart.render();
      chart.on(ChartEvent.PLOT_CLICK, () => {});
    }

    destroy.addEventListener('click', () => {
      if (chart) {
        chart.destroy();
      }
    });
    init.addEventListener('click', () => {
      initChart();
    });
    let l = true;
    change.addEventListener('click', () => {
      const timeData = generateTime('2023-01-01 09:00:00', 200, 120);
      // let yData1 = generateY(200, range1);
      // let yData2 = generateY(200, range2);
      // const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));
      l = !l;
      const d2 = timeData.map((x, i) => ({ x, y: l ? null : yData1[i] }));
      const data = [
        {
          name: 'area11',
          // color: 'rgb(var(--aui-color-green))',
          values: d2,
        },
        {
          name: 'area2',
          values: d2,
        },
      ];
      chart.data(data);
    });

    update.addEventListener('click', () => {
      chart.interaction('brush-x', {
        end: [
          {
            trigger: ChartEvent.PLOT_MOUSEUP,
            action: ActionType.BRUSH_X_END,
            callback: e => {
              console.log('brush-x', e);
            },
          },
        ],
      });
    });
  });

  return `
  <button id="destroy" type="close">destroy</button>
  <button id="init">initChart</button>
  <button id="change">change data</button>
  <button id="update">update</button>
  <span class="text">close</span>
  <div style="width: 100%; height: 200px; display: flex;">
  <div  style="width:100%;height:100%;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
    <div class="chart-area"></div>
  </div>
</div>
  `;
};

export const Demo = Template.bind({});
