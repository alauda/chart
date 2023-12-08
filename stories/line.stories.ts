import { Story, Meta } from '@storybook/html';

import { dealWithTime, generateData } from './utilt';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Line',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    console.time('render');
    const d1 = generateData('2023-01-31 09:00:00', 60, 60);
    let opts = {
      container: '.chart1',
      data: [
        {
          name: 'line',
          values: d1,
        },
        {
          name: 'line2',
          values: generateData('2023-01-31 09:00:00', 60, 60),
        },
      ],
      options: {
        title: { text: 'chart' },
        // legend: {
        //   position: 'bottom-right',
        // }
        annotation: {
          // lineX: {
          //   data: d1[i].x,
          //   text: {
          //     content: i,
          //   }
          // },
          lineY: {
            data: '3',
            text: {
              content: '1111',
            },
          },
        },
        scale: {
          // y: { max: 100, min: 10 },
          // y: {}
        },
        line: {
          step: 'start',
        },
        tooltip: {
          // showTitle: false
          titleFormatter: (title: string) =>
            `${dealWithTime(new Date(Number(title) * 1000))}`,
        },
      },
    };
    const chart = new Chart(opts as any);
    chart.line();
    // console.log(chart);
    // chart.data(data);
    // chart.shape('line');
    // chart.shape('bar', { name: 'line2' });
    chart.render();
    const reactive: any = chart.reactive();

    const btn = document.getElementById('change');
    // let bb = true;
    let i = 0;
    btn.onclick = () => {
      // reactive.options.title.text = String(Math.random() * 1000);
      // reactive.options.legend = {
      //   position: 'bottom-right',
      // };
      // bb = !bb
      // reactive.options.tooltip = {
      //   showTitle: bb,
      //   titleFormatter: '{title}111'
      // }
      reactive.options.annotation = {
        // lineX: {
        //   data: d1[i].x,
        //   text: {
        //     content: i,
        //   }
        // },
        lineY: {
          data: d1[i].y,
          text: {
            content: String(i),
          },
        },
      };
      // reactive.options.scale = {
      //   y: { max: 100, min: 10 },
      // };
      // reactive.options.tooltip = false;
      // reactive.data = [
      //   {
      //     name: 'line1',
      //     values: generateData('2023-01-31 09:00:00', 60, 60),
      //   },
      //   {
      //     name: 'line2',
      //     values: generateData('2023-01-31 09:00:00', 60, 60),
      //   },
      // ];
      i = i + 1;
    };
  });

  return `
    <button id="change">change params</button>
    <div style="width: 500px; height: 200px;"> 
      <div class="chart1" ></div>
    </div>
  `;
};

export const line = Template.bind({});
// line.args = {
//   primary: true,
//   label: 'Button',
// };
// line.parameters = {
//   backgrounds: {
//     values: [
//       { name: 'red', value: '#f00' },
//       { name: 'green', value: '#0f0' },
//       { name: 'blue', value: '#00f' },
//     ],
//   },
// };

// 图表类型  line area bar
// 大数据量
// sliding 动态效果
