import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { Chart } from '@alauda/chart';
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
    const groupPieData = [
      {
        name: '部署',
        value: 1,
        color: '#006eff',
        util: '%',
      },
    ];
    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data,
        // height: 80,
        options: {
          title: {
            text: '123123',
          },
          legend: false,
          // tooltip: false,
          gauge: {
            max: 100,
            label: {
              text: '<div style="font-size: 30px; color: #666;">{value}{data[0].util}</div>',
              description: 'asd12312312312',
              // position: {
              //   y: 10,
              // },
            },
            colors: [
              [0, '#73BF69'],
              [20, '#EAB839'],
              [70, 'red'],
            ],
            // text: {
            //   show: true,
            //   size: 12,
            //   // color: 'red' || () => 'red'
            // },
          },
        },
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart', groupPieData));
      chart.gauge({
        // outerRadius: 60,
        // innerRadius: 0.2,
        // colors: [
        //   [0.2, '#73BF69'],
        //   [0.5, '#EAB839'],
        //   [1, 'red'],
        // ],
        // label: {
        //   text: '<div style="font-size: 30px; color: #666;">50</div>',
        //   position: {
        //     // y: 5,
        //   },
        // },
        // text: {
        //   show: false,
        //   size: 12,
        //   // color: 'red' || () => 'red'
        // },
      });
      chart.interaction('element-active');
      chart.render();
    }
  });

  return `
  <div style="width: 100%; height: 260px; display: flex;">
  <div  style="width:100%;height:100%;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
    <div class="chart"></div>
  </div>
</div>
  `;
};

export const Gauge = Template.bind({});
