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
    // const groupPieData = [
    //   {
    //     name: '部署',
    //     value: 7038600,
    //     color: '#999',
    //   },

    //   {
    //     name: '有状态',
    //     value: 7038360,
    //     color: '#0abf5b',
    //   },
    //   {
    //     name: '守护',
    //     value: 7039320,
    //     color: '#006eff',
    //   },
    //   {
    //     name: 'sss',
    //     value: 52186903,
    //     color: '#999',
    //   },
    // ];

    const data = [
      {
        name: '{"__name__":"shared_dict_free","endpoint":"https-metrics","instance":"192.168.139.138:11782","job":"alb2-global-alb2","name":"http_certs_cache","namespace":"cpaas-system","node_name":"192.168.139.138","pod":"global-alb2-654b589d9d-f5vsh","service":"global-alb2"}',
        value: 1,
      },
      {
        name: '{"__name__":"shared_dict_free","endpoint":"https-metrics","instance":"192.168.139.138:11782","job":"alb2-global-alb2","name":"http_alb_cache","namespace":"cpaas-system","node_name":"192.168.139.138","pod":"global-alb2-654b589d9d-f5vsh","service":"global-alb2"}',
        value: 1,
      },
      { name: '52186903', value: 4 },
      {
        name: '397374320397374320397374320397374320397374320397374320397374320',
        value: 5,
      },
      { name: '1', value: 4 },
      { name: '2', value: 3 },
      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },      { name: '1', value: 4 },
      { name: '2', value: 3 },
    ];

    function getOp(container: string, data: any): any {
      return {
        container,
        // data: [],
        data,
        options: {
          legend: false,
          tooltip: true,
          pie: {
            // startAngle: -(Math.PI / 1.4),
            // endAngle: Math.PI / 1.4,
            // padAngle: 0.05,
            // total: 100,
            labelLine: {
              labels: ['name'],
              show: true,
            },
            // label: {
            //   text: '<div>1000</div>',
            // },
            // backgroundColor: '#ededed',
            // itemStyle: {
            //   borderWidth: 0,
            //   borderRadius: 0,
            // },
            // innerDisc: true
          },
        },
      };
    }
    initChart();
    function initChart() {
      chart = new Chart(getOp('.chart', data));
      chart.pie();
      chart.interaction('element-active');
      chart.render();
      const pie = document.getElementsByClassName(
        'pie-chart',
      )[0] as HTMLElement;
      pie.style.width = `${window.innerWidth - 100}px`;
      // pie.style.height = `${window.innerHeight - 100}px`;
      pie.style.height = `188px`;

      window.addEventListener('resize', () => {
        const pie = document.getElementsByClassName(
          'pie-chart',
        )[0] as HTMLElement;
        pie.style.width = `${window.innerWidth - 100}px`;
        // pie.style.height = `240px`;
        pie.style.height = `${window.innerHeight - 100}px`;
      });
    }
  });

  return `
  <div class="pie-chart">
    <div style="width: 100%; height: 100%; display: flex;">
      <div  style="width:100%;height:100%;padding: 20px 16px ;  box-sizing: border-box; flex: 2;">
        <div class="chart"></div>
      </div>
  </div>
</div>
  `;
};

export const Pie = Template.bind({});
