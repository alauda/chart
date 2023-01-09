import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { dealWithTime, generateTime, generateY, getRandom } from './utilt';

import { Chart } from '@alauda/chart';
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
    const total = 600;
    const step = 600;
    const start = '2023-01-31 09:00:00';
    const range1: [number, number] = [5, 10];
    const range2: [number, number] = [4, -12];
    const timeData = generateTime(start, total, step);
    let yData1 = generateY(total, range1);
    let yData2 = generateY(total, range2);
    const d1 = timeData.map((x, i) => ({ x, y: yData1[i] }));
    const d2 = timeData.map((x, i) => ({ x, y: yData2[i] }));

    chart = new Chart({
      container: '.chart-area',
      data: [
        {
          name: 'area1',
          values: d1,
        },
        {
          name: 'area2',
          values: d2,
        },
      ],
      options: {
        title: { text: 'chart' },
        // legend: {
        //   position: 'bottom-right',
        // }
        tooltip: {
          // showTitle: false
          titleFormatter: title =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    });
    // console.log(chart);
    // chart.data(data);
    chart.shape('area');
    // chart.shape('bar', { name: 'line2' });
    chart.render();

    const auto = document.querySelector('#autoUpdate');
    const text = document.querySelector('.text');
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
  });
  return `
  <button id="autoUpdate" type="close">自动更新</button>
  <span class="text">close</span>
  <div class="chart-area" style="width: 100%; height: 200px; "></div>
  `;
};

export const Area = Template.bind({});

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
