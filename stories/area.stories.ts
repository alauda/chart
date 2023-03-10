import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { dealWithTime, generateTime, generateY, getRandom } from './utilt';

import { ActionType, Chart, ChartEvent, resizeObserver } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Area',
} as Meta;

let chart: Chart;

const Template: Story = () => {
  addons.getChannel().on(DARK_MODE_EVENT_NAME, (e: boolean) => {
    chart?.theme(e ? 'dark' : 'light');
  });

  setTimeout(() => {
    const auto = document.querySelector('#autoUpdate');
    const text = document.querySelector('.text');
    const total = 60;
    const step = 720;
    const start = '2023-01-31 09:00:00';
    const range1: [number, number] = [0, 100];
    const range2: [number, number] = [0, 100];
    const timeData = generateTime(start, total, step);
    let yData1 = generateY(total, range1);
    let yData2 = generateY(total, range2);

    const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));
    const d2 = timeData.map((x, i) => ({ x, y: yData2[i] }));
    function getOp(container: string): any {
      return {
        container,
        // data: [],
        data: [
          {
            name: 'area1',
            // color: 'rgb(var(--aui-color-green))',
            values: d1,
          },
          {
            name: 'area2',
            values: d2,
          },
        ],
        options: {
          // title: { text: '1231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312123123123123121231231231231212312312312312' },
          // title: { text: '11', custom: true },

          //   position: 'bottom-right',
          // }
          axis: {
            // x: {
            //   formatter: (value: string) => {
            //     console.log(value)
            //     return `${value}%1`
            //   },
            // },
            // y: {
            //   autoSize: true,
            //   formatter: `{value}%1`,
            // },
          },
          scale: {
            x: {
              time: true
            },
            y: {
              // max: undefined,
              // min: undefined,
            },
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
          // tooltip: false,
        },
      };
    }
    chart = new Chart(getOp('.chart-area'));
    // console.log(chart);
    // chart.data(data);
    // chart.title(false)
    chart.legend(false);
    chart.area();
    // chart.annotation().lineY({
    //   data: 20,
    //   text: {
    //     content: 'line',
    //     position: 'right',
    //   },
    // });
    // chart.annotation().lineX({
    //   data: d1[10].x,
    //   text: {
    //     // border: {
    //     //  style: '2px solid red',
    //     //  padding: [0, 5]
    //     // },
    //     style: {
    //       fontSize: '20px',
    //       color: 'red',
    //     },
    //     content: '1111',
    //   },
    // });
    // chart.axis('y', {autoSize: false})
    // chart.shape('bar', { name: 'line2' });
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
    chart.render();
    // let bb = true;
    let ind = 1;
    chart.on(ChartEvent.PLOT_CLICK, e => {
      console.log('e', e);
      // const timeData = generateTime(start, total, step);
      // let yData1 = generateY(total, [0, +(Math.random() * 100).toFixed(2)]);
      // let yData2 = generateY(total, [5, 10]);

      // const d1 = timeData.map((x, i) => ({ x, y: bb ? null : yData1[i] }));
      // const d2 = timeData.map((x, i) => ({ x, y: bb ? null : yData2[i] }));
      // chart.data([
      //   {
      //     name: 'area1',
      //     // color: 'rgb(var(--aui-color-green))',
      //     values: d1,
      //   },
      //   {
      //     name: 'area2',
      //     values: d2,
      //   },
      // ]);
      // bb = !bb;
      ind += 1
      chart.annotation().lineY({
        data: ind,
        text: {
          content: 'line',
          position: 'left',
        },
      });
      // chart.setScale
      // chart.setScale('y', { max: 200 });
      chart.annotation().lineX({
        data: e.title,
        text: {
          border: {
            style: '2px solid red',
            padding: [0, 5],
          },
          style: {
            fontSize: '12px',
            color: '#999',
          },
          content: '2023-02-07 09:45:00',
        },
      });
    });

    // const chart2 = new Chart(getOp('.chart-area2'));
    // chart2.area();
    // chart2.render();

    // console.log('111',chart)
    // console.log('222',chart2)

    let interval: NodeJS.Timer;
    let animationFrame: number;
    let index = 0;
    function update() {
      const end = new Date(start).valueOf() / 1000 + total * step;
      // interval = setInterval(() => {
      //   index += 1;
      //   const time = end + index * step;
      //   const current = dealWithTime(new Date(time * 1000));
      //   const timeData = generateTime(current, total, step);
      //   yData1 = yData1.slice(1).concat(getRandom());
      //   yData2 = yData2.slice(1).concat(getRandom([0, 10]));
      //   const data = [
      //     {
      //       name: 'area1',
      //       values: timeData.map((x, i) => ({ x, y: yData1[i] })),
      //     },
      //     {
      //       name: 'area2',
      //       values: timeData.map((x, i) => ({ x, y: yData2[i] })),
      //     },
      //   ];
      //   chart.data(data);
      // }, 200);

      index += 1;
      const time = end + index * step;
      const current = dealWithTime(new Date(time * 1000));
      const timeData = generateTime(current, total, step);
      yData1 = yData1.slice(1).concat(getRandom(range1));
      yData2 = yData2.slice(1).concat(getRandom(range2));
      const data = [
        {
          name: 'area1',
          values: timeData.map((x, i) => ({ x, y: yData1[i] })),
        },
        {
          name: 'area2',
          values: timeData.map((x, i) => ({ x, y: yData2[i] })),
        },
      ];
      chart.data(data);

      animationFrame = requestAnimationFrame(update);
    }

    auto.addEventListener('click', () => {
      const type = auto.getAttribute('type');
      const val = type === 'open' ? 'close' : 'open';
      if (val === 'open') {
        update();
      } else {
        cancelAnimationFrame(animationFrame);
        clearInterval(interval);
      }
      auto.setAttribute('type', val);
      text.innerHTML = val;
    });

    resizeObserver(document.querySelector('.chart-area'), () => {
      console.log('change');
    });
  });

  return `
  <button id="autoUpdate" type="close">自动更新</button>
  <span class="text">close</span>
  <div style="width: 100%; height: 200px; display: flex;">
  <div  style="width:100%;height:100%;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
    <div class="chart-area"></div>
  </div>
</div>
  <!--
  <div style="width: 100%; height: 180px; border: 1px solid #ccc; display: flex;">
  
    <div  style="width:100%;height:100%;padding: 20px 16px ;  border: 1px solid red;   box-sizing: border-box; flex: 2;">
      <div class="chart-area2" style="width:100%;height:100%;  border: 1px solid #5200f5;"></div>
    </div>
  </div>
  -->
  `;
};

export const Area = Template.bind({});

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
