import React, { useState, useReducer, useEffect } from "react";

import { ColumnHeader, DataRow, Suggestion } from "../types";
import {
  evaluateIvyProgram,
  getMissingFields,
  // LanguageExtension,
  Template,
  TemplateMap,
  GenWidget,
  Json,
} from "../ivy-lang";
import { wrangle } from "../utils";
import { classnames } from "../utils";

export interface RendererProps {
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
}

/**
 * Support for a particular language
 */
export interface LanguageExtension {
  /**
   * React Component containing the rendering logic for this language
   */
  renderer: (props: RendererProps) => JSX.Element;
  /**
   * Given a code block and the collection of widgets, try to come up with suggestions to parameterize the code
   * @param code
   * @param widgets
   * @return Suggestions[]
   */
  suggestion: (
    code: string,
    widgets: GenWidget[],
    columns: ColumnHeader[]
  ) => Suggestion[];
  language: string;
  blankTemplate: Template;
  getDataViews: (props: RendererProps) => Promise<any>;
}

const MemoizeRender = React.memo(
  function Memoizer(props: {
    renderer: (props: RendererProps) => JSX.Element;
    spec: any;
    data: DataRow[];
  }): JSX.Element {
    const { renderer, data, spec } = props;
    let render: JSX.Element;
    try {
      render = renderer({ data, spec, onError: console.error });
      return render;
    } catch (e) {
      return <div />;
    }
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.spec) === JSON.stringify(nextProps.spec) &&
      JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
    );
  }
);

interface ChartContainerProps {
  data: DataRow[];
  languages: { [x: string]: LanguageExtension };
  template: Template;
  templateMap: TemplateMap;
}

function ChartArea(props: ChartContainerProps): JSX.Element {
  const { data, languages, template, templateMap } = props;
  // temp props
  const missingFields = [] as string[];
  // const setMaterialization = () => {};
  const templateComplete = true;
  const [evaledProgram, setEvaledProgram] = useState<Json>({});
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {
    const prog = evaluateIvyProgram(template, templateMap);
    setEvaledProgram(prog);
    setReady(true);
  }, [JSON.stringify(template), JSON.stringify(templateMap)]);
  // TODO memoize
  const preparedData = wrangle(data, templateMap.dataTransforms);

  const renderer =
    languages[template.templateLanguage] &&
    languages[template.templateLanguage].renderer;
  // const showChart = renderer && templateComplete;
  const showChart = templateComplete && ready;

  return (
    <div
      // style={{ overflow: "hidden", width: width }}
      className={classnames({ "flex-down": true, "full-height": true })}
    >
      <div
        className={classnames({
          "chart-container": true,
        })}
      >
        {showChart && (
          <MemoizeRender
            renderer={renderer}
            data={preparedData}
            spec={evaledProgram}
          />
        )}
        {!showChart && (
          <div className="chart-unfullfilled">
            <h2> Chart is not yet filled out </h2>
            <h5>
              Select values for the following fields: {missingFields.join(", ")}
            </h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChartArea;
