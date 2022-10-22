import { expect, test } from "@jest/globals";

import { applyConditionals, evaluateIvyProgram } from "../src/ivy-lang";
import { TemplateMap } from "./ivy-lang";
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
  console.log(JSON.stringify(output, null, 2));
  expect(output).toMatchSnapshot();
});

test.only("evaluateIvyProgram polestar template", () => {
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
