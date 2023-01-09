import { Story, Meta } from '@storybook/html';

import { dealWithTime, generateData } from './utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Point',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    console.time('render');
    const chart = new Chart({
      container: '.chart1',
      data: [
        {
          name: 'point1',
          values: generateData('2023-01-31 09:00:00', 10_000, 60),
        },
        {
          name: 'point2',
          values: generateData('2023-01-31 09:00:00', 10_000, 60),
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
    chart.shape('point');
    // chart.shape('bar', { name: 'line2' });
    chart.render();
  });
  return `
    <div class="chart1" style="width: 100%; height: 200px; "></div>
  `;
};

export const Point = Template.bind({});

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
