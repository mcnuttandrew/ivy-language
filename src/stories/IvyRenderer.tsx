import React, { useState, useReducer, useEffect } from "react";

import { ColumnHeader, TemplateMap, DataRow, Suggestion } from "../types";
import {
  evaluateIvyProgram,
  getMissingFields,
  // LanguageExtension,
  Template,
  GenWidget,
  Json,
} from "../ivy-lang";
import { HoverTooltip } from "../tooltips";
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
  // utility for using the data table debugger
  getDataViews: (props: RendererProps) => Promise<any>;
}

interface MemoizerProps {
  renderer: (props: RendererProps) => JSX.Element;
  spec: any;
  data: DataRow[];
  onError: (x: any) => any;
  editorError: null | string;
}

const MemoizeRender = React.memo(
  function Memoizer(props: MemoizerProps): JSX.Element {
    const { renderer, onError, data, spec, editorError } = props;
    if (editorError) {
      return <div />;
    }
    onError(null);
    let render: JSX.Element;
    try {
      render = renderer({ data, spec, onError });
      return render;
    } catch (e) {
      onError(e);
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
  //   columns: ColumnHeader[];
  //   currentView: string;
  //   currentlySelectedFile: string;
  data: DataRow[];
  //   editMode: boolean;
  languages: { [x: string]: LanguageExtension };
  //   editorError: null | string; // move to state
  //   missingFields: string[]; // move to state
  //   spec: any; // move to state
  // templateComplete: boolean; // move to state
  template: Template;
  templateMap: TemplateMap;
  //   templates: Template[];
  // views: string[];
  //   viewCatalog: ViewCatalog;
  // width: number;
}

function ChartArea(props: ChartContainerProps): JSX.Element {
  const {
    data,
    // editorError,
    languages,
    // missingFields,
    // setAllTemplateValues,
    // setMaterialization,
    // spec,
    template,
    // templateComplete,
    templateMap,
    // width,
  } = props;
  // temp props
  const missingFields = [] as string[];
  // const setMaterialization = () => {};
  const spec = {};
  const templateComplete = true;
  const [errors, setErrors] = useState(null);
  const [showData, setShowData] = useState(false);
  const [evaledProgram, setEvaledProgram] = useState<Json>({});
  const [ready, setReady] = useState<boolean>(false);
  useEffect(() => {
    const prog = evaluateIvyProgram(template, templateMap);
    setEvaledProgram(prog);
    setReady(true);
  }, [JSON.stringify(template), JSON.stringify(templateMap)]);
  // TODO memoize
  const preparedData = wrangle(data, templateMap.systemValues.dataTransforms);

  const renderer =
    languages[template.templateLanguage] &&
    languages[template.templateLanguage].renderer;
  // const showChart = renderer && templateComplete;
  const showChart = templateComplete && ready;

  // const preCart = Object.entries(
  //   templateMap.systemValues.viewsToMaterialize
  // ).map(([key, values]) => {
  //   return values.map((value) => ({ key, value }));
  // });
  // const materializedViews = preCart.length
  //   ? [...cartesian(...preCart)].map((combo) => {
  //       return combo.reduce(
  //         (acc: any, row: any) => ({ ...acc, [row.key]: row.value }),
  //         {}
  //       );
  //     })
  //   : [];

  return (
    <div
      // style={{ overflow: "hidden", width: width }}
      className={classnames({ "flex-down": true, "full-height": true })}
    >
      <div
        className={classnames({
          "chart-container": true,
          // "multi-view-container": materializedViews.length > 0,
        })}
      >
        {/* {templateComplete && materializedViews.length === 0 && ( */}
        <MemoizeRender
          renderer={renderer}
          data={preparedData}
          spec={spec}
          editorError={null}
          onError={setErrors}
        />
        {/* )} */}
        {/* {showChart &&
          materializedViews.length > 0 &&
          materializeWrapper({
            data: preparedData,
            materializedViews: materializedViews.map(
              (paramValues: {
                [x: string]: string | string[];
              }): TemplateMap => ({
                systemValues: { viewsToMaterialize: {}, dataTransforms: [] },
                paramValues,
              })
            ),
            editorError: null,
            renderer,
            setAllTemplateValues,
            setMaterialization,
            setErrors,
            spec,
            template,
            templateMap,
          })} */}
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

// export function mapStateToProps({
//   base,
//   data,
// }: {
//   base: AppState;
//   data: DataReducerState;
// }): any {
//   const template = base.currentTemplateInstance;
//   const templateMap = base.templateMap;
//   const missingFields =
//     (template && getMissingFields(template, templateMap)) || [];
//   const spec = evaluateIvyProgram(template, templateMap);
//   return {
//     columns: base.columns,
//     currentView: base.currentView,
//     currentlySelectedFile: base.currentlySelectedFile,
//     data: data.data,
//     editorError: base.editorError,
//     missingFields,
//     spec,
//     template,
//     templateComplete: !missingFields.length,
//     templateMap,
//     templates: base.templates,
//     numTemplate: base.templates.length,
//     views: base.views,
//     viewCatalog: base.viewCatalog,
//   };
// }

// function equalityChecker(prevProps: any, nextProps: any): boolean {
//   return Object.keys(prevProps).every((key) => {
//     if (key === "spec" || key === "missingFields") {
//       return JSON.stringify(prevProps[key]) === JSON.stringify(nextProps[key]);
//     }
//     return prevProps[key] === nextProps[key];
//   });
// }

export default ChartArea;

// export default connect(
//   mapStateToProps,
//   actionCreators
// )(React.memo(ChartArea, equalityChecker));
