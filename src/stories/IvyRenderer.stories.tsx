import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import penguins from "vega-datasets/data/penguins.json";

import IvyRenderer from "./IvyRenderer";
import languages from "../languages/lang-index";
import Polestar from "../templates/polestar-template";

export default {
  title: "Example/Ivy",
  component: IvyRenderer,
} as ComponentMeta<typeof IvyRenderer>;

const Template: ComponentStory<typeof IvyRenderer> = (args) => (
  <IvyRenderer {...args} />
);

const templateMap = {
  paramValues: {
    Color: null,
    ColorAgg: '"none"',
    ColorBin: "true",
    ColorType: '"nominal"',
    column: [],
    Column: null,
    Detail: null,
    DetailType: '"nominal"',
    height: 100,
    markType: '"point"',
    nominalColor: '"set2"',
    opacity: 0.8,
    quantColor: '"blues"',
    row: [],
    Row: null,
    Shape: null,
    ShapeType: '"nominal"',
    showHeight: "false",
    showWidth: "false",
    Size: null,
    SizeAgg: '"none"',
    SizeBin: "true",
    SizeType: '"ordinal"',
    Text: null,
    TextAgg: '"none"',
    TextType: '"nominal"',
    width: 100,
    X: '"Beak Depth (mm)"',
    XAgg: '"none"',
    XIncludeZero: "true",
    XScaleType: '"linear"',
    XTimeUnit: '"null"',
    XType: '"quantitative"',
    Y: '"Beak Length (mm)"',
    YAgg: '"none"',
    YIncludeZero: "true",
    YScaleType: '"linear"',
    YTimeUnit: '"null"',
    YType: '"quantitative"',
  },
  systemValues: { viewsToMaterialize: {}, dataTransforms: [] },
};

export const ExampleChart = Template.bind({});
ExampleChart.args = {
  templateMap: (templateMap as unknown) as any,
  languages,
  data: penguins,
  template: Polestar,
};
