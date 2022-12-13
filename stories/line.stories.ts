import { Story, Meta } from '@storybook/html';

import { Chart } from '@alauda/chart';

export default {
  title: 'Line',
} as Meta;

const Template: Story = () => {
  setTimeout(() => {
    const chart = new Chart({ container: '#chart' });
    console.log(chart);
  });
  return `<div id="chart" style="width: 100%; height: 300px; background: #ddd;">
   
  </div>`;
};

export const line = Template.bind({});
