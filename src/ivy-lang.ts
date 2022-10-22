import { trim } from "./utils";

/**
 * Type necessary to define the validator pull over here
 * in order to prevent stack overflow on the schema builder
 */
export type DataType = "MEASURE" | "DIMENSION" | "TIME" | "CUSTOM";

export type WidgetType =
  | "DataTarget"
  | "MultiDataTarget"
  | "List"
  | "Switch"
  | "Text"
  | "Slider"
  | "Section"
  // | 'Shortcut'
  | "FreeText";
export interface Widget<T> {
  /**
   *   The name of widget to be used, this name will be swapped into the code string, must be unqiue
   */
  name: string;
  /**
   * The name to be shown in the GUI, does not have to be unique.
   */
  displayName?: string;
  /**
   * The type of the widget to be used, this defined the specific gui item that the user interacts with
   */
  type: WidgetType;
  config: T;
  /**
   * Sometimes you want to decative certain values depending on the state of the UI
   * This advanced features allows you to do that
   */
  conditions?: Condition[];
}
export interface DataTargetWidget {
  allowedTypes: DataType[];
  required: boolean;
}
export interface MultiDataTargetWidget {
  allowedTypes: DataType[];
  minNumberOfTargets?: number;
  maxNumberOfTargets?: number;
  required: boolean;
}
export interface ListWidget {
  allowedValues: ({ display: string; value: string } | string)[];
  defaultValue?: string;
}
export interface SwitchWidget {
  active: string;
  inactive: string;
  defaultsToActive: boolean;
}
export interface TextWidget {
  text: string;
}
export type SectionWidget = null;
export interface SliderWidget {
  minVal: number;
  maxVal: number;
  step?: number;
  defaultValue: number;
}

export interface Shortcut {
  label: string;
  shortcutFunction: string;
}

export type FreeTextWidget = {
  useParagraph: boolean;
};
export type WidgetSubType =
  | DataTargetWidget
  | MultiDataTargetWidget
  | ListWidget
  | SwitchWidget
  | TextWidget
  | SliderWidget
  | SectionWidget
  | FreeTextWidget;

/**
 * The main configuration object for templates
 */
export interface Template {
  /**
   * The language of the code, determines how the code will be interpreted.
   * Ivy currently supports vega, vega-lite, and it's own data table system
   *
   *  __Default value:__ `vega-lite`
   */
  templateLanguage: string;

  /**
   * The name of the template. Template names must be unique, so this can over-ride other extant templates
   */
  templateName: string;

  /**
   * The description that users will see in the chart chooser gallery
   */
  templateDescription?: string;

  /**
   * The creator of the template
   */
  templateAuthor: string;

  /**
   * The code to be interpreted by the renderer
   */
  code: string;

  /**
   * The mechanism by which users interact with your template
   */
  widgets: Widget<WidgetSubType>[];

  /**
   * Advanced tool for providing special extra cards
   */
  customCards?: CustomCard[];

  /**
   * Whether or not to allow view materialization / fan out
   */
  disallowFanOut?: boolean;
}

/**
 * Convience container type for the general template widget case
 */
export type GenWidget = Widget<WidgetSubType>;

export type CustomCard = { name: string; description: string };
/**
 * A widget Condition query, executed raw javascript. Parameter values (the value of the current ui)
 * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
 * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
 */
export type ConditionQuery = string;

/**
 * What to do in response to the result of the query, should be either 'hide' or 'show'
 */
export type QueryResult = "show" | "hide";
export interface Condition {
  /**
   * What to do in response to the result of the query, should be either 'hide' or 'show'
   */
  queryResult: QueryResult;

  /**
   * A widget Condition query, executed raw javascript. Parameter values (the value of the current ui)
   * is accessed through parameters.VALUE. E.g. if you wanted to construct a predicate that check if
   * there wasn't a current value for the x dimension called xDim you could do "!parameters.xDim"
   */
  query: string;
}

/* eslint-disable no-new-func */
export interface TemplateMap {
  paramValues: {
    [key: string]: string | string[];
  };
  systemValues: {
    dataTransforms: DataTransform[];
    viewsToMaterialize: ViewsToMaterialize;
  };
}

export type ViewsToMaterialize = { [x: string]: string[] };
/**
 * vega transform syntax
 */
export interface DataTransform {
  [x: string]: any;
}

export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<
  string | number | boolean | null | JsonArray | JsonMap
>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;

interface ConditionalArgs {
  query: string;
  true?: Json;
  false?: Json;
}
export type IvyLangConditional = { $cond: ConditionalArgs };
export interface NewIvyConditional {
  $if: "string";
  true?: Json;
  false?: Json;
}

/**
 *
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function evaluateIvyProgram(
  template: Template,
  templateMap: TemplateMap
): Json {
  // 1. apply variables to string representation of code
  const interpolatedVals = setTemplateValues(template.code, templateMap);
  // 2. parse to json
  let parsedJson = null;
  try {
    parsedJson = JSON.parse(interpolatedVals);
  } catch (e) {
    console.error("crash", e);
    console.error("crashed on ", interpolatedVals);
    parsedJson = {};
  }
  // 3. evaluate inline conditionals
  const evaluatableSpec = applyConditionals(templateMap)(parsedJson);
  // 4. return
  return evaluatableSpec;
}

/**
 * Apply values from templatemap (specification) to template
 * Important to do it this way and not via json parse because values might be parts of strings
 * Example {"field": "datum["[VARIABLENAME]"]}
 * @param code
 * @param templateMap - the specification/variable values defined by the gui
 */
export const setTemplateValues = (
  code: string,
  templateMap: TemplateMap
): string => {
  const filledInSpec = Object.entries(templateMap.paramValues).reduce(
    (acc: string, row) => {
      const [key, value]: [string, string | string[] | null] = row;
      const reWith = new RegExp(`"\\[${key}\\]"`, "g");
      const reWithout = new RegExp(`\\[${key}\\]`, "g");
      // AM: not sure about this isArray biz
      if (!Array.isArray(value) && trim(value) !== value) {
        // this supports the weird HACK required to make the interpolation system
        // not make everything a string
        return acc
          .replace(reWith, value || "null")
          .replace(reWithout, trim(value as string) || "null");
      }
      const setVal =
        (Array.isArray(value) && JSON.stringify(value)) || value || "null";
      return acc
        .replace(reWith, setVal as string)
        .replace(reWithout, setVal as string);
    },
    code
  );
  return filledInSpec;
};

// syntax example
// {...example,
// mark: {
//   type: 'point',
//   tooltip: true,
//   color: {$cond: {true: '[Single Color]', false: null, query: {Color: null}}},
// }}
// TODO: a lot of the logic in this could be cleaned up into a pretty combinator pattern
/**
 * Walk across the tree and apply conditionals are appropriate,
 * example conditional syntax: {$cond: {true: '[Single Color]', false: null, query: '!parameters.Color}}
 *
 * @param templateMap - the specification/variable values defined by the gui
 * @returns JSON (any is the dumb stand in for json)
 */
export function applyConditionals(
  templateMap: TemplateMap
): (spec: Json) => Json {
  return function walker(spec: Json): Json {
    // if it's array iterate across it
    if (Array.isArray(spec)) {
      return spec.reduce((acc: JsonArray, child) => {
        // OLD SYNTAX
        if (child && typeof child === "object" && (child as JsonMap).$cond) {
          const valuemap = (child as unknown) as IvyLangConditional;
          const queryResult = evaluateQuery(valuemap.$cond.query, templateMap)
            ? "true"
            : "false";
          if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
            return acc.concat(walker(valuemap.$cond[queryResult] as Json));
          } else {
            return acc;
          }
        }
        // NEW SYNTAX
        if (child && typeof child === "object" && (child as JsonMap).$if) {
          const valuemap = (child as unknown) as NewIvyConditional;
          const queryResult = evaluateQuery(valuemap.$if, templateMap)
            ? "true"
            : "false";
          if (
            !shouldUpdateContainerWithValue(
              queryResult,
              (valuemap as unknown) as ConditionalArgs
            )
          ) {
            return acc.concat(walker(valuemap[queryResult] as Json));
          } else {
            return acc;
          }
        }
        return acc.concat(walker(child));
      }, []);
    }
    // check if it's null or not an object return
    if (!(typeof spec === "object" && spec !== null)) {
      return spec;
    }
    // if the object being consider is itself a conditional evaluate it
    // OLD SYNTAX
    if (typeof spec === "object" && spec.$cond) {
      const valuemap = (spec as unknown) as IvyLangConditional;
      const queryResult = evaluateQuery(valuemap.$cond.query, templateMap)
        ? "true"
        : "false";
      if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
        return walker(valuemap.$cond[queryResult] as Json);
      } else {
        return null;
      }
    }
    // NEW SYNTAX
    if (typeof spec === "object" && spec.$if) {
      const valuemap = (spec as unknown) as NewIvyConditional;
      const queryResult = evaluateQuery(valuemap.$if, templateMap)
        ? "true"
        : "false";
      if (
        !shouldUpdateContainerWithValue(
          queryResult,
          (valuemap as unknown) as ConditionalArgs
        )
      ) {
        return walker(valuemap[queryResult] as Json);
      } else {
        return null;
      }
    }
    // otherwise looks through its children
    return Object.entries(spec).reduce(
      (acc: JsonMap, [key, value]: [string, Json]) => {
        let computedKey = key;
        if (key.match(/\[(.*)\]/)) {
          computedKey = tryToComputeKey(key, templateMap);
        }
        if (value && typeof value === "object" && (value as JsonMap).$cond) {
          // OLD SYNTAX
          // if it's a conditional, if so execute the conditional
          const valuemap = (value as unknown) as IvyLangConditional;
          const queryResult = evaluateQuery(valuemap.$cond.query, templateMap)
            ? "true"
            : "false";
          if (!shouldUpdateContainerWithValue(queryResult, valuemap.$cond)) {
            acc[computedKey] = walker(valuemap.$cond[queryResult] as Json);
          }
        } else if (
          value &&
          typeof value === "object" &&
          (value as JsonMap).$if
        ) {
          // NEW SYNTAX
          // if it's a conditional, if so execute the conditional
          const valuemap = (value as unknown) as NewIvyConditional;
          const queryResult = evaluateQuery(valuemap.$if, templateMap)
            ? "true"
            : "false";
          if (
            !shouldUpdateContainerWithValue(
              queryResult,
              (valuemap as unknown) as ConditionalArgs
            )
          ) {
            acc[computedKey] = walker(valuemap[queryResult] as Json);
          }
        } else {
          acc[computedKey] = walker(value);
        }
        return acc;
      },
      {}
    );
  };
}

function shouldUpdateContainerWithValue(
  queryResult: "true" | "false",
  conditional: ConditionalArgs
): boolean {
  // if a conditional doesn't want that value to get added to the traversing object then ingnore it
  return !Object.keys(conditional).includes(queryResult);
}

/**
 * Evaluate a ivy query, used for the widget conditions and conditional checks
 * // TODO: this system doesn't support data type checking?
 * @param query - for now uses the special widget condition langugage
 * @param templateMap - the specification/variable values defined by the gui
 */
function evaluateQuery(
  query: ConditionQuery,
  templateMap: TemplateMap
): boolean {
  // TODO add a type check function to this
  // TODO can probable keep a cache of these results?
  let result = false;
  try {
    const generatedContent = new Function(
      "parameters",
      prepareFunction(query, templateMap)
    );
    result = Boolean(generatedContent(templateMap.paramValues));
  } catch (e) {
    console.log("Query Evaluation Error", e, query, templateMap.paramValues);
  }
  return result;
}

function prepareFunction(query: string, templateMap: TemplateMap): string {
  return `
        ${Object.keys(templateMap.paramValues)
          .map((key) => key.replace(/(_|\W)/g, ""))
          .map((key) => `const ${key} = parameters.${key}`)
          .join("\n")}
      return ${query};`;
}

function tryToComputeKey(query: string, templateMap: TemplateMap): string {
  let result = query.slice(1).slice(0, query.length - 2);
  try {
    const generatedContent = new Function(
      "parameters",
      prepareFunction(result, templateMap)
    );
    result = generatedContent(templateMap.paramValues);
  } catch (e) {
    console.log("Key Evaluation Error", e, query, templateMap.paramValues);
  }
  return `${result}`;
}

/**
 * Generate a list of the missing fields on a template
 * @param template
 * @param templateMap - the specification/variable values defined by the gui
 */
export function getMissingFields(
  template: Template,
  templateMap: TemplateMap
): string[] {
  const params = templateMap.paramValues;

  // data target
  const missingFileds = template.widgets
    .filter(
      (d) =>
        d.type === "DataTarget" &&
        (d as Widget<DataTargetWidget>).config.required
    )
    .filter((d) => !params[d.name])
    .map((d) => d.name);

  // multi data target
  const missingMultiFileds = template.widgets
    .filter(
      (d) =>
        d.type === "MultiDataTarget" &&
        (d as Widget<MultiDataTargetWidget>).config.required
    )
    // .filter(
    //   (widget: Widget<MultiDataTargetWidget>) =>
    //     !params[widget.name] ||
    //     params[widget.name].length < widget.config.minNumberOfTargets
    // )

    .filter(
      (widget: any) =>
        !params[widget.name] ||
        params[widget.name].length < widget.config.minNumberOfTargets
    )
    .map((d) => d.name);
  return missingFileds.concat(missingMultiFileds);
}
