# Annotation
> 标注 在图表上标识额外的标记注解， 暂时只支持 lineX lineY

## Api

```ts
chart.annotation().lineX(options) // 命令式
chart.annotation().lineY(options)


new Chart({annotation: {lineX: options, lineY: options}}) // 配置式
```

## Option

```ts
export interface AnnotationOption {
  lineX?: AnnotationLineOption;
  lineY?: AnnotationLineOption;
}

export interface AnnotationLineOption {
  data: string | number; // x y 坐标数据
  text?: { // 不设置则默认展示 data 
    position?: 'left' | 'right' | string; // 文本位置
    content: unknown; // 文本
    style?: object; // 样式
    border?: { // 文本边框样式
      style?: string;
      padding?: [number, number];
    };
  };
  style?: { // 样式
    stroke?: string;
    width?: number;
    lineDash?: [number, number];
  };
}
```

## Todo

- [ ] 支持用户自定义 annotation 
