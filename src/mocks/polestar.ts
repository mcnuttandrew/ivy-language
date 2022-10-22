import { TemplateMap } from "../ivy-lang";
export const PolestarDefaultParams: TemplateMap = {
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
  X: null,
  XAgg: '"none"',
  XIncludeZero: "true",
  XScaleType: '"linear"',
  XTimeUnit: '"null"',
  XType: '"quantitative"',
  Y: null,
  YAgg: '"none"',
  YIncludeZero: "true",
  YScaleType: '"linear"',
  YTimeUnit: '"null"',
  YType: '"quantitative"',
  dataTransforms: [],
};

export const poleStarBody = {
  $schema: "https:vega.github.io/schema/vega-lite/v4.json",
  transform: [],
  repeat: {
    $if: "Object.values(parameters).includes('\\\"row\\\"') || Object.values(parameters).includes('\\\"column\\\"')",
    true: {
      row: {
        $if: "Object.values(parameters).includes('\\\"row\\\"')",
        true: "[row]",
      },
      column: {
        $if: "Object.values(parameters).includes('\\\"column\\\"')",
        true: "[column]",
      },
    },
  },
  encoding: {
    $if: "!(Object.values(parameters).includes('\\\"row\\\"') || Object.values(parameters).includes('\\\"column\\\"'))",
    true: {
      x: {
        $if: "Boolean(X)",
        true: {
          field: {
            $if: "Boolean(X) && !X.includes('COUNT')",
            true: {
              $if: "(X.includes('row')) || (X.includes('column'))",
              true: { repeat: "[X]" },
              false: "[X]",
            },
          },
          type: {
            $if: "X.includes('COUNT')",
            true: "quantitative",
            false: "[XType]",
          },
          aggregate: {
            $if: "!XAgg.includes('none') && X && XType.includes('quantitative') || X.includes('COUNT')",
            true: {
              $if: "X.includes('COUNT')",
              true: "count",
              false: "[XAgg]",
            },
          },
          timeUnit: {
            $if: "Boolean(X) && XType.includes('temporal') && !XTimeUnit.includes('null')",
            true: "[XTimeUnit]",
          },
          scale: {
            $if: "!X.includes('COUNT')",
            true: {
              zero: {
                $if: "Boolean(X) && !XIncludeZero.includes('true') && (XType.includes('quantitative') || X.includes('COUNT'))",
                true: "[XIncludeZero]",
              },
              type: {
                $if: "Boolean(X) && XType.includes('quantitative')",
                true: "[XScaleType]",
              },
            },
          },
        },
      },
      y: {
        $if: "Boolean(Y)",
        true: {
          field: {
            $if: "Boolean(Y) && !Y.includes('COUNT')",
            true: {
              $if: "(Y.includes('row')) || (Y.includes('column'))",
              true: { repeat: "[Y]" },
              false: "[Y]",
            },
          },
          type: {
            $if: "Y.includes('COUNT')",
            true: "quantitative",
            false: "[YType]",
          },
          aggregate: {
            $if: "!YAgg.includes('none') && Y && YType.includes('quantitative') || Y.includes('COUNT')",
            true: {
              $if: "Y.includes('COUNT')",
              true: "count",
              false: "[YAgg]",
            },
          },
          timeUnit: {
            $if: "Boolean(Y) && YType.includes('temporal') && !YTimeUnit.includes('null')",
            true: "[YTimeUnit]",
          },
          scale: {
            $if: "!Y.includes('COUNT')",
            true: {
              zero: {
                $if: "Boolean(Y) && !YIncludeZero.includes('true') && (YType.includes('quantitative') || Y.includes('COUNT'))",
                true: "[YIncludeZero]",
              },
              type: {
                $if: "Boolean(Y) && YType.includes('quantitative')",
                true: "[YScaleType]",
              },
            },
          },
        },
      },
      size: {
        $if: "Boolean(Size)",
        true: {
          field: {
            $if: "Boolean(Size) && !Size.includes('COUNT')",
            true: {
              $if: "(Size.includes('row')) || (Size.includes('column'))",
              true: { repeat: "[Size]" },
              false: "[Size]",
            },
          },
          type: {
            $if: "Size.includes('COUNT')",
            true: "quantitative",
            false: "[SizeType]",
          },
          aggregate: {
            $if: "!SizeAgg.includes('none') && Size && SizeType.includes('quantitative') || Size.includes('COUNT')",
            true: {
              $if: "Size.includes('COUNT')",
              true: "count",
              false: "[SizeAgg]",
            },
          },
          bin: {
            $if: "SizeBin.includes('true') && SizeType.includes('quantitative')",
            true: true,
          },
        },
      },
      color: {
        $if: "Boolean(Color)",
        true: {
          field: {
            $if: "Boolean(Color) && !Color.includes('COUNT')",
            true: {
              $if: "(Color.includes('row')) || (Color.includes('column'))",
              true: { repeat: "[Color]" },
              false: "[Color]",
            },
          },
          type: {
            $if: "Color.includes('COUNT')",
            true: "quantitative",
            false: "[ColorType]",
          },
          aggregate: {
            $if: "!ColorAgg.includes('none') && Color && ColorType.includes('quantitative') || Color.includes('COUNT')",
            true: {
              $if: "Color.includes('COUNT')",
              true: "count",
              false: "[ColorAgg]",
            },
          },
          bin: {
            $if: "ColorBin.includes('true') && ColorType.includes('quantitative')",
            true: true,
          },
          scale: {
            $if: "Color",
            true: {
              scheme: {
                $if: 'ColorType.includes("nominal") && !Color.includes("COUNT")',
                true: "[nominalColor]",
                false: "[quantColor]",
              },
            },
          },
        },
      },
      shape: {
        $if: "Boolean(Shape)",
        true: {
          field: {
            $if: "Boolean(Shape) && !Shape.includes('COUNT')",
            true: {
              $if: "(Shape.includes('row')) || (Shape.includes('column'))",
              true: { repeat: "[Shape]" },
              false: "[Shape]",
            },
          },
          type: "[ShapeType]",
          aggregate: {
            $if: "!ShapeAgg.includes('none') && Shape && ShapeType.includes('quantitative') || Shape.includes('COUNT')",
            true: {
              $if: "Shape.includes('COUNT')",
              true: "count",
              false: "[ShapeAgg]",
            },
          },
        },
      },
      text: {
        $if: "Boolean(Text)",
        true: {
          field: {
            $if: "Boolean(Text) && !Text.includes('COUNT')",
            true: {
              $if: "(Text.includes('row')) || (Text.includes('column'))",
              true: { repeat: "[Text]" },
              false: "[Text]",
            },
          },
          type: "[TextType]",
          aggregate: {
            $if: "!TextAgg.includes('none') && Text && TextType.includes('quantitative') || Text.includes('COUNT')",
            true: {
              $if: "Text.includes('COUNT')",
              true: "count",
              false: "[TextAgg]",
            },
          },
        },
      },
      detail: {
        $if: "Boolean(Detail)",
        true: {
          field: {
            $if: "Boolean(Detail) && !Detail.includes('COUNT')",
            true: {
              $if: "(Detail.includes('row')) || (Detail.includes('column'))",
              true: { repeat: "[Detail]" },
              false: "[Detail]",
            },
          },
          type: "[DetailType]",
          aggregate: {
            $if: "!DetailAgg.includes('none') && Detail && DetailType.includes('quantitative') || Detail.includes('COUNT')",
            true: {
              $if: "Detail.includes('COUNT')",
              true: "count",
              false: "[DetailAgg]",
            },
          },
        },
      },
      row: { $if: "Boolean(Row)", true: { field: "[Row]", type: "nominal" } },
      column: {
        $if: "Boolean(Column)",
        true: { field: "[Column]", type: "nominal" },
      },
    },
  },
  mark: {
    $if: "!(Object.values(parameters).includes('\\\"row\\\"') || Object.values(parameters).includes('\\\"column\\\"'))",
    true: { type: "[markType]", tooltip: true, opacity: "[opacity]" },
  },
  spec: {
    $if: "Object.values(parameters).includes('\\\"row\\\"') || Object.values(parameters).includes('\\\"column\\\"')",
    true: {
      encoding: {
        x: {
          $if: "Boolean(X)",
          true: {
            field: {
              $if: "Boolean(X) && !X.includes('COUNT')",
              true: {
                $if: "(X.includes('row')) || (X.includes('column'))",
                true: { repeat: "[X]" },
                false: "[X]",
              },
            },
            type: {
              $if: "X.includes('COUNT')",
              true: "quantitative",
              false: "[XType]",
            },
            aggregate: {
              $if: "!XAgg.includes('none') && X && XType.includes('quantitative') || X.includes('COUNT')",
              true: {
                $if: "X.includes('COUNT')",
                true: "count",
                false: "[XAgg]",
              },
            },
            timeUnit: {
              $if: "Boolean(X) && XType.includes('temporal') && !XTimeUnit.includes('null')",
              true: "[XTimeUnit]",
            },
            scale: {
              $if: "!X.includes('COUNT')",
              true: {
                zero: {
                  $if: "Boolean(X) && !XIncludeZero.includes('true') && (XType.includes('quantitative') || X.includes('COUNT'))",
                  true: "[XIncludeZero]",
                },
                type: {
                  $if: "Boolean(X) && XType.includes('quantitative')",
                  true: "[XScaleType]",
                },
              },
            },
          },
        },
        y: {
          $if: "Boolean(Y)",
          true: {
            field: {
              $if: "Boolean(Y) && !Y.includes('COUNT')",
              true: {
                $if: "(Y.includes('row')) || (Y.includes('column'))",
                true: { repeat: "[Y]" },
                false: "[Y]",
              },
            },
            type: {
              $if: "Y.includes('COUNT')",
              true: "quantitative",
              false: "[YType]",
            },
            aggregate: {
              $if: "!YAgg.includes('none') && Y && YType.includes('quantitative') || Y.includes('COUNT')",
              true: {
                $if: "Y.includes('COUNT')",
                true: "count",
                false: "[YAgg]",
              },
            },
            timeUnit: {
              $if: "Boolean(Y) && YType.includes('temporal') && !YTimeUnit.includes('null')",
              true: "[YTimeUnit]",
            },
            scale: {
              $if: "!Y.includes('COUNT')",
              true: {
                zero: {
                  $if: "Boolean(Y) && !YIncludeZero.includes('true') && (YType.includes('quantitative') || Y.includes('COUNT'))",
                  true: "[YIncludeZero]",
                },
                type: {
                  $if: "Boolean(Y) && YType.includes('quantitative')",
                  true: "[YScaleType]",
                },
              },
            },
          },
        },
        size: {
          $if: "Boolean(Size)",
          true: {
            field: {
              $if: "Boolean(Size) && !Size.includes('COUNT')",
              true: {
                $if: "(Size.includes('row')) || (Size.includes('column'))",
                true: { repeat: "[Size]" },
                false: "[Size]",
              },
            },
            type: {
              $if: "Size.includes('COUNT')",
              true: "quantitative",
              false: "[SizeType]",
            },
            aggregate: {
              $if: "!SizeAgg.includes('none') && Size && SizeType.includes('quantitative') || Size.includes('COUNT')",
              true: {
                $if: "Size.includes('COUNT')",
                true: "count",
                false: "[SizeAgg]",
              },
            },
            bin: {
              $if: "SizeBin.includes('true') && SizeType.includes('quantitative')",
              true: true,
            },
          },
        },
        color: {
          $if: "Boolean(Color)",
          true: {
            field: {
              $if: "Boolean(Color) && !Color.includes('COUNT')",
              true: {
                $if: "(Color.includes('row')) || (Color.includes('column'))",
                true: { repeat: "[Color]" },
                false: "[Color]",
              },
            },
            type: {
              $if: "Color.includes('COUNT')",
              true: "quantitative",
              false: "[ColorType]",
            },
            aggregate: {
              $if: "!ColorAgg.includes('none') && Color && ColorType.includes('quantitative') || Color.includes('COUNT')",
              true: {
                $if: "Color.includes('COUNT')",
                true: "count",
                false: "[ColorAgg]",
              },
            },
            bin: {
              $if: "ColorBin.includes('true') && ColorType.includes('quantitative')",
              true: true,
            },
            scale: {
              $if: "Color",
              true: {
                scheme: {
                  $if: 'ColorType.includes("nominal") && !Color.includes("COUNT")',
                  true: "[nominalColor]",
                  false: "[quantColor]",
                },
              },
            },
          },
        },
        shape: {
          $if: "Boolean(Shape)",
          true: {
            field: {
              $if: "Boolean(Shape) && !Shape.includes('COUNT')",
              true: {
                $if: "(Shape.includes('row')) || (Shape.includes('column'))",
                true: { repeat: "[Shape]" },
                false: "[Shape]",
              },
            },
            type: "[ShapeType]",
            aggregate: {
              $if: "!ShapeAgg.includes('none') && Shape && ShapeType.includes('quantitative') || Shape.includes('COUNT')",
              true: {
                $if: "Shape.includes('COUNT')",
                true: "count",
                false: "[ShapeAgg]",
              },
            },
          },
        },
        text: {
          $if: "Boolean(Text)",
          true: {
            field: {
              $if: "Boolean(Text) && !Text.includes('COUNT')",
              true: {
                $if: "(Text.includes('row')) || (Text.includes('column'))",
                true: { repeat: "[Text]" },
                false: "[Text]",
              },
            },
            type: "[TextType]",
            aggregate: {
              $if: "!TextAgg.includes('none') && Text && TextType.includes('quantitative') || Text.includes('COUNT')",
              true: {
                $if: "Text.includes('COUNT')",
                true: "count",
                false: "[TextAgg]",
              },
            },
          },
        },
        detail: {
          $if: "Boolean(Detail)",
          true: {
            field: {
              $if: "Boolean(Detail) && !Detail.includes('COUNT')",
              true: {
                $if: "(Detail.includes('row')) || (Detail.includes('column'))",
                true: { repeat: "[Detail]" },
                false: "[Detail]",
              },
            },
            type: "[DetailType]",
            aggregate: {
              $if: "!DetailAgg.includes('none') && Detail && DetailType.includes('quantitative') || Detail.includes('COUNT')",
              true: {
                $if: "Detail.includes('COUNT')",
                true: "count",
                false: "[DetailAgg]",
              },
            },
          },
        },
        row: { $if: "Boolean(Row)", true: { field: "[Row]", type: "nominal" } },
        column: {
          $if: "Boolean(Column)",
          true: { field: "[Column]", type: "nominal" },
        },
      },
      mark: { type: "[markType]", tooltip: true, opacity: "[opacity]" },
    },
  },
  height: { $if: 'showHeight.includes("true")', true: "[height]" },
  width: { $if: 'showWidth.includes("true")', true: "[width]" },
};

export const POLESTAR_BODY = JSON.stringify(poleStarBody);
