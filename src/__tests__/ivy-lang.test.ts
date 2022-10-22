import { expect, test } from "@jest/globals";

import evaluateIvyProgram, { applyConditionals, TemplateMap } from "..";
import ScatterplotCode from "./mocks/scatterplot";
import { PolestarDefaultParams, POLESTAR_BODY } from "./mocks/polestar";

const produce = (
  inputState: TemplateMap,
  writer: (draft: TemplateMap) => void
) => {
  const copy = JSON.parse(JSON.stringify(inputState));
  writer(copy);
  return copy;
};

test("#applyConditionals", () => {
  const PARSED_CODE = JSON.parse(ScatterplotCode);

  const exampleTemplateMap1: TemplateMap = {
    Color: null,
    showBand: "true",
    showNulls: "true",
  };
  expect(applyConditionals(exampleTemplateMap1)(PARSED_CODE)).toMatchSnapshot();

  const exampleTemplateMap2: TemplateMap = {
    Color: "Wowza good dimension",
    showBand: "true",
    showNulls: "true",
  };
  const output = applyConditionals(exampleTemplateMap2)(PARSED_CODE);
  expect(output).toMatchSnapshot();
});

test("evaluateIvyProgram polestar template", () => {
  const templateMap = PolestarDefaultParams;

  expect(evaluateIvyProgram(POLESTAR_BODY, templateMap)).toMatchSnapshot();
  const templateMap2 = produce(templateMap, (draftState) => {
    draftState.X = '"GooD Dimension"';
    draftState.XIncludeZero = "false";
  });
  expect(evaluateIvyProgram(POLESTAR_BODY, templateMap2)).toMatchSnapshot();

  const templateMap3 = produce(templateMap, (draftState) => {
    draftState.X = '"Origin"';
    draftState.XType = '"nominal"';
    draftState.ColorAggSimple = '"count"';
  });
  expect(evaluateIvyProgram(POLESTAR_BODY, templateMap3)).toMatchSnapshot();
});

test("Docs Test", () => {
  const settings = { xDim: '"Origin"', sort: "false" };
  const body = {
    $schema: "https:vega.github.io/schema/vega-lite/v4.json",
    transform: [],
    encoding: {
      y: {
        field: "[xDim]",
        type: "nominal",
        sort: { $if: "parameters.sort.includes('true')", true: "-x" },
      },
      x: { aggregate: "count" },
    },
    mark: "bar",
  };
  console.log(JSON.stringify(body));
  const output = evaluateIvyProgram(JSON.stringify(body), settings);
  expect(output).toMatchSnapshot();
});
