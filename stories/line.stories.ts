import { Story, Meta } from '@storybook/html';
import '../src/theme/default.scss';
import '@alauda/chart';

export default {
  title: 'Line',
} as Meta;

const Template: Story = () => {
  return `<div style="width: 100%; height: 300px">
    <ac-chart>
      <ac-view><ac-view>
      <ac-title><ac-title>
    </ac-chart>
  </div>`;
};

export const line = Template.bind({});
