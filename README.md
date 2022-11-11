# Ivy Language

This is an exported version of the evaluator for the [Ivy](https://github.com/mcnuttandrew/ivy) template language.
It exposes one method, `evaluateIvyProgram`, which takes the body of an Ivy template (as a JSON formatted string) as well as an object to apply to that body, and returns a JavaScript Object.
It has a type signature like `evaluateIvyProgram(body: string, settings: Record<string, any>) => Json`.

Aiming to be modular, this library does not include the rendering component of the Ivy system: it contains only the code for converting the ivy language into something processable by another entity.

## The Language itself

The basic idea of the language is that it combines JSON with a series of simple abstraction operations that enable simpler re-usability.
Through this language we are able to treat charts specified in JSON-based domain specifics languages as functions, with the content of the function being referred to as the **body** and the arguments being referred to as the **settings**.
There are two key abstraction mechanisms within these programs, substitutions and control flow, which we discuss in greater depth below. 

## Example

Let's look at a toy example:

```js
import evaluateIvyProgram from "ivy-language";

// note that strings need to be wrapped as they are evaluated as raw otherwise!!
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

const output = evaluateIvyProgram(JSON.stringify(body), settings);
```

This will assign `output` the value:

```json
{
  "$schema": "https:vega.github.io/schema/vega-lite/v4.json",
  "encoding": {
    "x": {
      "aggregate": "count"
    },
    "y": {
      "field": "Origin",
      "type": "nominal"
    },
  },
  "mark": "bar",
  "transform": []
}
```


The `settings` object defies values for the parameters named `xDim` and `sort`.

Every occurrence of `[xDim]` in the body is replaced by the corresponding value for `xDim` in `settings` (`"Origin"`).

The `sort` field of the `y` channel is a conditional: if the expression defined by the `$if` field is true then the condition is replaced by `"-x"`; if not then that `sort` field is removed because there is no `false` branch described in the conditional.

Additional examples can be found in the [tests](./src/__tests__).

## Substitutions

Substitutions are the bread and butter of the Ivy Template Language.
They enable the template designer to slot in lots of different types of values into the body.
Aywhere in the template body where there is a match between a key name, such as `xDim`, in the settings and a string in the body, such as `"[xDim]"`, the matching string is replaced with the corresponding value in from the settings.

## Control Flow with conditionals

Sometimes you need to specify a conditional value when you are designing a template. Perhaps you have a Color Variable/ DataTarget where, if it's defined, you want there to be color scheme picker, and if it's not then you want there to be a single value picker. To achieve these ends you should use a conditional.

You can think of them as being a way to represent [JavaScript's ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator) in JSON; they do one thing if an expression is `true`, and another if it is `false`.

Conditionals have the structure:

```json
{
  "$if": "QUERY",
  "true": "VALUE_IF_TRUE",
  "false": "VALUE_IF_FALSE"
}
```

**QUERY**: This is a string containing a JavaScript string that will be evaluated. 
The only object that is has access to is a `settings` object containing the values of the parameters.
The result of the query will be treated as a Boolean, so please keep in mind the various quirks of JavaScript's notions of truthy/falsy, or, better yet, use explicit `true` and `false`.

Here are a few recipes:

- If you are trying to check if a value is a Boolean, then try `"query": "parameters.varName.includes('true')"`
- If you are trying to check if a value has not been defined at all, then try `"query": "!parameters.varName"`. (If `varName` is null then negating it will be true).

**VALUE_IF_TRUE** / **VALUE_IF_FALSE**: These optional values are the values taken on by the conditional if the query results in true or false. 
These values can be anything: arrays, objects, numbers, strings, other conditionals. As long as it's a valid Ivy template language snippet than it's valid.

_An import special behavior note_: the true and false branches are optional. Typically if the conditional encounters a query that results in a path that is not defined then it will remove that conditional. If the conditional is the value of a key-value pair (as in an object) it will delete the key, if it is an array, that cell will be removed. We saw an example of this in the example at the top of the page.

An important gotcha here is that the values of the parameters object should all be treated as strings.
