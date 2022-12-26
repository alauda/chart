export const UPLOT_DEFAULT_OPTIONS = {
  legend: {
    show: false,
    live: false, // 关闭当前值
  },
  axes: [
    {
     
      grid: {
        show: false,
      },
      ticks: {
        width: 1,
      },
    },
    {
      grid: {
        width: 1,
      },
      ticks: {
        width: 1,
      },
    },
  ],
  cursor: {
    focus: {
      prox: 10, // 鼠标移入点激活  像素激活距离
    },
  },
};
