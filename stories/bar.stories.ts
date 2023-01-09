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
        { name: 'bar1', values: generateData('2023-01-31 09:00:00', 20, 60) },
        { name: 'bar2', values: generateData('2023-01-31 09:00:00', 20, 60) },
      ],
      options: {
        title: { text: 'bar chart' },
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
    chart.shape('bar');
    // chart.shape('line', { name: 'bar2' });
    chart.render();
  });
  return `<div class="chart-bar" style="width: 100%; height: 200px; "></div>`;
};

export const Bar = Template.bind({});

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
