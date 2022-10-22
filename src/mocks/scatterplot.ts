const SCATTERPLOT_EXAMPLE: any = {
  $schema: "https://vega.github.io/schema/vega-lite/v4.json",
  layer: [
    {
      $if: 'parameters.showBand.includes("true")',
      true: {
        mark: { type: "errorband", extent: "stdev", opacity: 0.2 },
        encoding: { y: { field: "[yDim]", type: "quantitative" } },
      },
    },
    {
      $if: 'parameters.showBand.includes("true")',
      true: {
        mark: "rule",
        encoding: {
          y: { field: "[yDim]", type: "quantitative", aggregate: "mean" },
        },
      },
    },

    {
      mark: {
        type: "point",
        tooltip: true,
        size: "[Radius]",
        color: {
          $if: "!parameters.Color",
          true: "[Single Color]",
          false: null,
        },
      },
      encoding: {
        x: { field: "[xDim]", type: "[xType]", scale: { zero: "[Zeroes]" } },
        y: { field: "[yDim]", type: "[yType]", scale: { zero: "[Zeroes]" } },
        color: {
          condition: {
            test: 'datum["[xDim]"] === null || datum["[yDim]"] === null',
            value: "#aaa",
          },
          field: { $if: "parameters.Color", true: "[Color]" },
          type: { $if: "parameters.Color", true: "[colorType]" },
        },
      },
    },
  ],
  config: {
    $if: 'parameters.showNulls.includes("true")',
    true: {
      mark: { invalid: null },
    },
  },
};

export default JSON.stringify(SCATTERPLOT_EXAMPLE);
