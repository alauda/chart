import { Story, Meta } from '@storybook/html';

import { groupPieData } from './data';

import { Chart } from '@alauda/chart';

import '../src/theme/default.scss';

export default {
  title: 'Pie',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    const chart = Chart({
      container: '#pieChart',
      type: 'pie',
      // title: {
      //   text: '环形图',
      // },
      legend: {
        // hide: true,
      },
      seriesOption: {
        outerRadius: 50,
        // backgroundColor: '#ededed',
        total: 100,
        label: {
          text: '<div>1000</div>',
          position: {
            x: '50%',
            y: '50%',
          },
        },
        itemStyle: {
          borderRadius: 2,
          borderWidth: 2,
        },
        innerDisc: true,
      },
      tooltip: {
        trigger: 'item',
        hideTitle: true,
      },
      data: groupPieData,
    });
    // chart.on(PIE_EVENTS.ITEM_HOVERED, function (e) {
    //   console.log(e);
    // });
    // chart.on(PIE_EVENTS.ITEM_MOUSEOUT, function (e) {
    //   console.log(e);
    // });
    setTimeout(() => {
      // chart.data(groupPieData);
      chart.updatePie({
        label: {
          text: '<div>2222</div>',
        },
      });
    }, 2000);
  }, 0);
  return `<div >
    <div style="max-width: 300px; height: 300px;border:1px solid #eee; " id="pieChart"></div>
  </div>`;
};

export const pie = Template.bind({});
