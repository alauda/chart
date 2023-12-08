import { Story, Meta } from '@storybook/html';

import { dealWithTime, generateData } from './utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Bar',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    const chart = new Chart({
      container: '.chart-bar',
      data: [
        // {
        //   name: 'bar1',
        //   values: [
        //     { x: 'a', y: 2 },
        //     { x: 'b', y: 4 },
        //     { x: 'c', y: 1 },
        //   ],
        // },
        // {
        //   name: 'bar2',
        //   values: [
        //     { x: 'a', y: 4 },
        //     { x: 'b', y: 2 },
        //     { x: 'c', y: 1 },
        //   ],
        // },
        // {
        //   name: 'bar3',
        //   values: [
        //     { x: 'a', y: 1 },
        //     { x: 'b', y: 1 },
        //     { x: 'c', y: 1 },
        //   ],
        // },
        { name: 'bar2', values: generateData('2023-01-31 09:00:00', 2, 2) },
        { name: 'bar3', values: generateData('2023-01-31 09:00:00', 2, 2) },
      ],
      options: {
        title: { text: 'bar chart' },
        // legend: {
        //   position: 'bottom-right',
        // }
        scale: {
          x: {
            time: false,
          },
        },
        tooltip: {
          // showTitle: false
          titleFormatter: title =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
        coordinate: { transposed: true },
        bar: {
          adjust: { type: 'stack' },
        },
      },
    });
    // console.log(chart);
    // chart.data(data);
    // chart.coordinate().transpose();
    chart.bar();
    // chart.bar().adjust({ type: 'stack' });
    // chart.shape('line', { name: 'bar2' });
    chart.annotation().lineY({
      data: 10,
      text: {
        content: 'line',
      },
    });
    chart.render();
  });
  return `
  <div style="height: 200px">
    <div class="chart-bar" style="width: 100%; height: 200px; "></div>
  </div>
  `;
};

export const Bar = Template.bind({});

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
