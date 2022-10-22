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
  [key: string]: string | string[] | null | number;
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
 * @param code - string. ivy template as string to be interpreted
 * @param templateMap - the specification/variable values defined by the gui
 */
export default function evaluateIvyProgram(
  code: string,
  templateMap: TemplateMap
): Json {
  // 1. apply variables to string representation of code
  const interpolatedVals = setTemplateValues(code, templateMap);
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
  const spec = applyConditionals(templateMap)(parsedJson);
  // 4. return
  return spec;
}

/**
 * Apply values from templateMap (specification) to template
 * Important to do it this way and not via JSON.parse() because values might be parts of strings
 * Example {"field": "datum["[VARIABLENAME]"]}
 * @param code
 * @param templateMap - the specification/variable values defined by the gui
 */
export const setTemplateValues = (
  code: string,
  templateMap: TemplateMap
): string => {
  const filledInSpec = Object.entries(templateMap).reduce(
    (acc: string, row) => {
      const [paramName, value] = row as [string, string];
      const reWithQuotes = new RegExp(`"\\[${paramName}\\]"`, "g");
      const reWithoutQuotes = new RegExp(`\\[${paramName}\\]`, "g");
      // AM: not sure about this isArray biz
      if (!Array.isArray(value) && trim(value) !== value) {
        // The value to substitute in starts and ends with quotes.
        // We handle this carefully: if the parameter name was not enclosed in quotes in the template,
        // then we remove the quotes from the value before substituting it in.
        // This allows values to be inserted into the generated JSON as datatypes other than strings.
        // See the unit tests for some examples of the resulting behaviour.
        return acc
          .replace(reWithQuotes, value || "null")
          .replace(reWithoutQuotes, trim(value as string) || "null");
      }
      const setVal =
        (Array.isArray(value) && JSON.stringify(value)) || value || "null";
      return acc
        .replace(reWithQuotes, setVal as string)
        .replace(reWithoutQuotes, setVal as string);
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
  const x = function walker(spec: Json): Json {
    // if it's array iterate across it
    if (Array.isArray(spec)) {
      return spec.reduce((acc: JsonArray, child) => {
        // OLD SYNTAX
        if (child && typeof child === "object" && (child as JsonMap).$cond) {
          const valueMap = child as unknown as IvyLangConditional;
          const queryResult = evaluateQuery(valueMap.$cond.query, templateMap)
            ? "true"
            : "false";
          if (!shouldUpdateContainerWithValue(queryResult, valueMap.$cond)) {
            return acc.concat(walker(valueMap.$cond[queryResult] as Json));
          } else {
            return acc;
          }
        }
        // NEW SYNTAX
        if (child && typeof child === "object" && (child as JsonMap).$if) {
          const valueMap = child as unknown as NewIvyConditional;
          const queryResult = evaluateQuery(valueMap.$if, templateMap)
            ? "true"
            : "false";
          if (
            !shouldUpdateContainerWithValue(
              queryResult,
              valueMap as unknown as ConditionalArgs
            )
          ) {
            return acc.concat(walker(valueMap[queryResult] as Json));
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
    // if the object being considered is itself a conditional then evaluate it
    // OLD SYNTAX
    if (typeof spec === "object" && spec.$cond) {
      const valueMap = spec as unknown as IvyLangConditional;
      const queryResult = evaluateQuery(valueMap.$cond.query, templateMap)
        ? "true"
        : "false";
      if (!shouldUpdateContainerWithValue(queryResult, valueMap.$cond)) {
        return walker(valueMap.$cond[queryResult] as Json);
      } else {
        return null;
      }
    }
    // NEW SYNTAX
    if (typeof spec === "object" && spec.$if) {
      const valueMap = spec as unknown as NewIvyConditional;
      const queryResult = evaluateQuery(valueMap.$if, templateMap)
        ? "true"
        : "false";
      if (
        !shouldUpdateContainerWithValue(
          queryResult,
          valueMap as unknown as ConditionalArgs
        )
      ) {
        return walker(valueMap[queryResult] as Json);
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
          const valueMap = value as unknown as IvyLangConditional;
          const queryResult = evaluateQuery(valueMap.$cond.query, templateMap)
            ? "true"
            : "false";
          if (!shouldUpdateContainerWithValue(queryResult, valueMap.$cond)) {
            acc[computedKey] = walker(valueMap.$cond[queryResult] as Json);
          }
        } else if (
          value &&
          typeof value === "object" &&
          (value as JsonMap).$if
        ) {
          // NEW SYNTAX
          // if it's a conditional, if so execute the conditional
          const valueMap = value as unknown as NewIvyConditional;
          const queryResult = evaluateQuery(valueMap.$if, templateMap)
            ? "true"
            : "false";
          if (
            !shouldUpdateContainerWithValue(
              queryResult,
              valueMap as unknown as ConditionalArgs
            )
          ) {
            acc[computedKey] = walker(valueMap[queryResult] as Json);
          }
        } else {
          acc[computedKey] = walker(value);
        }
        return acc;
      },
      {}
    );
  };
  return x;
}

function shouldUpdateContainerWithValue(
  queryResult: "true" | "false",
  conditional: ConditionalArgs
): boolean {
  // if a conditional doesn't want that value to get added to the traversing object then ignore it
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
    result = Boolean(generatedContent(templateMap));
  } catch (e) {
    console.log("Query Evaluation Error", e, query, templateMap);
  }
  return result;
}

function prepareFunction(query: string, templateMap: TemplateMap): string {
  // prepend query by statements assigning each attribute of paramValues to a const variable with the corresponding name
  return `
        ${Object.keys(templateMap)
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
    result = generatedContent(templateMap);
  } catch (e) {
    console.log("Key Evaluation Error", e, query, templateMap);
  }
  return `${result}`;
}

// setting dimensions requires that dimension name be wrapped in a string
// here we strip them off so that the channel encoding can find the correct value
export function trim(dimName: string): string {
  if (!dimName || dimName.length < 2) {
    return dimName;
  }
  if (dimName[0] === '"' && dimName[dimName.length - 1] === '"') {
    return dimName.slice(1, dimName.length - 1);
  }
  return dimName;
}
