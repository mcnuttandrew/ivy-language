import {
  DataTransform,
  Widget,
  GenWidget,
  SwitchWidget,
  ListWidget,
  SliderWidget,
  TemplateMap,
} from "./ivy-lang";
import { DataRow } from "./types";

export function wrangle(data: any[], transforms: DataTransform[]): any {
  const predicates = transforms.map((d) => (row: DataRow): boolean => {
    const fieldVal = row[d.filter.field];
    switch (d.filter.type) {
      case "DIMENSION":
        return !!d.filter.range.find(
          (key: string) => `${key}` === `${fieldVal}`
        );
      case "MEASURE":
        return (
          Number(fieldVal) >= d.filter.range[0] &&
          Number(fieldVal) <= d.filter.range[1]
        );
      case "TIME":
        return (
          new Date(fieldVal) >= new Date(d.filter.range[0]) &&
          new Date(fieldVal) <= new Date(d.filter.range[1])
        );
      default:
        return true;
    }
  });
  return data.filter((row) => predicates.every((pred) => pred(row)));
}

export function classnames(classObject: { [val: string]: boolean }): string {
  return Object.keys(classObject)
    .filter((name) => classObject[name] && name)
    .join(" ");
}

// setting dimensions requires that dimension name be wrapped in a string
// here we strip them off so that the channel cencoding can find the correct value
export function trim(dimName: string): string {
  if (!dimName || dimName.length < 2) {
    return dimName;
  }
  if (dimName[0] === '"' && dimName[dimName.length - 1] === '"') {
    return dimName.slice(1, dimName.length - 1);
  }
  return dimName;
}

// safely access elements on a nested object
export function get(obj: any, route: (string | number)[]): any {
  if (!obj) {
    return null;
  }
  if (route.length === 0) {
    return null;
  }
  if (route.length === 1) {
    return obj[route[0]];
  }
  const next = obj[route[0]];
  if (!next) {
    return null;
  }
  return get(next, route.slice(1));
}

const DUMMY = "xxxxxEXAMPLExxxx";
export function generateFullTemplateMap(widgets: GenWidget[]): TemplateMap {
  const paramValues = widgets.reduce(
    (acc: { [x: string]: any }, widget: GenWidget) => {
      const widgetType = widget.type;
      if (widgetType === "DataTarget") {
        acc[widget.name] = `"${DUMMY}"`;
      }
      if (widgetType === "MultiDataTarget") {
        acc[widget.name] = `[${DUMMY}, ${DUMMY}]`;
      }
      if (widgetType === "List") {
        const localW = widget as Widget<ListWidget>;
        acc[widget.name] =
          localW.config.defaultValue ||
          get(localW, ["config", "allowedValues", 0, "value"]);
      }
      if (widgetType === "Switch") {
        const localW = widget as Widget<SwitchWidget>;
        acc[widget.name] = localW.config.active;
      }
      if (widgetType === "Slider") {
        const localW = widget as Widget<SliderWidget>;
        acc[widget.name] = localW.config.defaultValue;
      }
      return acc;
    },
    {}
  );

  return {
    paramValues,
    systemValues: { viewsToMaterialize: {}, dataTransforms: [] },
  };
}

export const toList = (list: string[]): { display: string; value: string }[] =>
  list.map((display) => ({
    display,
    value: `"${display}"`,
  }));
