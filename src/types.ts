import { DataType, Template, GenWidget, TemplateMap } from "./ivy-lang";

/**
 * The meta data for a particular data column.
 *
 */
export interface ColumnHeader {
  type: DataType;
  originalType: DataType;
  secondaryType?: string;
  field: string;
  domain: number[] | string[];
  summary: any;
}

// https://github.com/microsoft/TypeScript/issues/1897
export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap;
}
export type JsonArray = Array<
  string | number | boolean | null | JsonArray | JsonMap
>;
export type Json = JsonMap | JsonArray | string | number | boolean | null;

export interface ViewCatalog {
  [x: string]: ViewCatalogEntry;
}
export interface ViewCatalogEntry {
  encodingMode: string;
  templateMap: TemplateMap;
  currentTemplateInstance: Template;
}
/**
 * vega transform syntax
 */
export interface DataTransform {
  [x: string]: any;
}
export interface UndoRedoStackItem {
  columns: ColumnHeader[];
  currentTemplateInstance: Template;
  currentView: string;
  encodingMode: string;
  codeMode: string;
  editMode: boolean;
  showProgrammaticMode: boolean;
  templateMap: TemplateMap;
  viewCatalog: ViewCatalog;
  views: string[];
}

export interface AppState {
  // meta-data
  columns: ColumnHeader[];
  currentlySelectedFile: string | null;

  // spec configs
  editMode: boolean;
  editorError: boolean;

  languages: { [x: string]: LanguageExtension };

  showTour: boolean;

  // GUI
  codeMode: string;
  currentTemplateInstance: Template;
  openModal: string | null;
  encodingMode: string;
  showGUIView: boolean;
  showProgrammaticMode: boolean;
  userName: string;

  // undo redo
  redoStack: UndoRedoStackItem[];
  undoStack: UndoRedoStackItem[];
  atomicLock: boolean;

  // view stuff
  currentView: string;
  viewCatalog: ViewCatalog;
  views: string[];

  // template stuff
  templateMap: TemplateMap;
  templates: Template[];
}
/**
 * @param T the type of payload argument
 */
export interface ActionResponse<T> {
  (state: AppState, payload: T): AppState;
}

export interface DataReducerState {
  data: { [x: string]: any }[];
}

export interface Suggestion {
  from: string;
  to: string;
  comment: string;
  sideEffect?: (
    setAllTemplateValues?: (updatedTemplateMap: TemplateMap) => null
  ) => GenWidget | null;
  codeEffect?: (code: string) => string;
  simpleReplace: boolean;
}

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

export type DataRow = { [x: string]: any };
