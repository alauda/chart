import { Story, Meta } from '@storybook/html';
import { timeFormat } from 'd3';

import { Chart } from '../src';
import { ScaleType } from '../src/types';

import { data } from './data';

import '../src/theme/default.scss';

export default {
  title: 'Line',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    Chart({
      container: '#chart',
      type: 'line',
      title: {
        text: '折线图',
        // hide: true,
        formatter: () => {
          return '折线图';
        },
        // offsetX: 20,
        // offsetY: 30,
        // hide: true,
      },
      legend: {
        // hide: true,
        // isMount: true,
        // formatter: () => {
        //   return document.getElementById('title').outerHTML;
        // },
        // offsetX: 20,
        // offsetY: 30,
        // formatter: data => `<div>11</div>`,
        // itemFormatter: `legend {name}`,
      },
      data: data.map(d => ({
        ...d,
        values: d.values.map(a => ({
          ...a,
          x: a.x * 1000,
          y: a.y * 1_000_000_000_000,
        })),
      })),
      yAxis: {
        // tickFormatter: (text) => {
        //   console.log(text)
        //   return text
        // },
      },
      xAxis: {
        type: ScaleType.TIME,
        tickFormatter: () => timeFormat('%m-%d %H:%M'),
      },
      tooltip: {
        // titleFormatter: (name: Date | number | string) =>
        //   `<div>${new Date(name)}</div>`,
        // itemFormatter: (values: TooltipContextItem[]) =>
        //   `<div>${JSON.stringify(values)}</div>`,
        // sort: (a, b) => a.y - b.y,
      },
      zoom: {
        enabled: false,
        // onzoomStart: d => {
        //   console.log('zoom start', d);
        // },
        // onzoom: d => {
        //   console.log('zoom', d);
        // },
        // onzoomEnd: d => {
        //   console.log('zoom end', d);
        // },
      },
      // contextCallbackFunction: (view: View) => {
      //   console.log(view);
      // },
      xPlotLine: {
        color: 'red',
        value: 120,
      },
      // contextCallbackFunction: view => {
      //   console.log('cb', view);
      //   setTimeout(() => {
      //     const legend = view.getController('legend');

      //     legend.legendUnselectAll();
      //     setTimeout(() => {
      //       legend.legendSelectAll();
      //     }, 1000);
      //   }, 2000);
      // },
    });
    // chart.on(RECT_EVENTS.CLICK, (value: TooltipContext) => {
    //   chart.updateYPlotLine(value);
    //   console.log(JSON.stringify(value));
    // });

    setTimeout(() => {
      // chart.updateTitle({
      //   text: '123123',
      //   formatter: () => '123123####',
      // });
      // chart.updateYPlotLine({
      //   title: 1637114400000,
      //   values: [
      //     {
      //       x: 1637114400000,
      //       y: 573,
      //       name: 'running',
      //       color: '#24b37a',
      //       activated: false,
      //     },
      //     {
      //       x: 1637114400000,
      //       y: 599,
      //       name: 'total_num',
      //       color: '#006eff',
      //       activated: false,
      //     },
      //   ],
      // });
      // chart.updateXPlotLine({value: 10});
    }, 1000);

    // setTimeout(() => {
    //   chart.data(data1);
    //   // chart.setOptions({
    //   //   zoom: {
    //   //     enabled: true,
    //   //   },
    //   // });
    // }, 1000);
  });
  return `<div>
    <div style="width: 100%; height: 190px;" id="chart"></div>
  </div>`;
};

export const line = Template.bind({});
