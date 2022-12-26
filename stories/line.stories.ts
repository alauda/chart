import { Story, Meta } from '@storybook/html';

import { Chart } from '@alauda/chart';

export default {
  title: 'Line',
} as Meta;

const data = [
  {
    name: 'line1',
    values: [
      { x: 1671684840, y: 200 },
      { x: 1671684900, y: 240 },
      { x: 1671684960, y: 120 },
      { x: 1671685020, y: 200 },
      { x: 1671685080, y: 90 },
    ],
  },
  {
    name: 'line2',
    values: [
      { x: 1671684840, y: 10 },
      { x: 1671684900, y: 24 },
      { x: 1671684960, y: 12 },
      { x: 1671685020, y: 20 },
      { x: 1671685080, y: 9 },
    ],
  },
];

const Template: Story = () => {
  setTimeout(() => {
    const chart = new Chart({ container: '#chart', data });
    // console.log(chart);
    chart.data(data)
  });
  return `<div id="chart" style="width: 100%; height: 300px; ">
   
  </div>`;
};

export const line = Template.bind({});
