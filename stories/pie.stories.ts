import addons from '@storybook/addons';
import { Story, Meta } from '@storybook/html';
import { DARK_MODE_EVENT_NAME } from 'storybook-dark-mode';

import { Chart } from '@alauda/chart';
import 'uplot/dist/uPlot.min.css';

export default {
  title: 'Pie',
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
        value: 10,
        color: '#999',
      },
      {
        name: '有状态',
        value: 20,
        color: '#0abf5b',
      },
      {
        name: '守护',
        value: 50,
        color: '#006eff',
      },
    ];
    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data,
        // options: {},
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart', groupPieData));
      chart.pie({
        // startAngle: -(Math.PI / 1.4),
        // endAngle: Math.PI / 1.4,
        innerRadius: 0.8,
        // total: 100,
        label: {
          text: '<div>1000</div>',
        },
        backgroundColor: '#ededed',
        itemStyle: {
          borderWidth: 0,
          borderRadius: 0,
        },
        // innerDisc: true
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

export const Pie = Template.bind({});
