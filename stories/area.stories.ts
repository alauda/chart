import { Story, Meta } from '@storybook/html';
import { timeFormat } from 'd3';

import { data } from './data';

import { Chart, ScaleType } from '@alauda/chart';

import '../src/theme/default.scss';

export default {
  title: 'Area',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    Chart({
      container: '#areaChart',
      type: 'area',
      title: {
        text: '面积图',
        // offsetX: 20,
        // offsetY: 30,
        // hide: true,
      },
      legend: {
        // hide: true,
        // offsetX: 20,
        // offsetY: 30,
        // formatter: (data: ChartData[]) => `<div>11${data[0].name}</div>`,
        // itemFormatter: `legend {name}`,
      },
      data,
      xAxis: {
        type: ScaleType.TIME,
        tickFormatter: () => timeFormat('%H:%M'),
      },
      tooltip: {
        titleFormatter: v => {
          return timeFormat('%m-%d %H:%M')(new Date(v.title));
        },
        // itemFormatter: (values: TooltipContextItem[]) =>
        //   `<div>${JSON.stringify(values)}</div>`,
        sort: (a, b) => a.y - b.y,
      },
    });
  });

  return `
    <div style="width: 500px; height: 210px">
    <div style="width: 100%; height: 100%" id="areaChart"></div>
    </div>
  `;
};

export const area = Template.bind({});
