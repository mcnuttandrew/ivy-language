import {applyConditionals, TemplateMap} from "..";

test("correct value is substituted if predicate is true", () => {
    const CODE = {$if: '!parameters.Color', true: '[Single Color]', false: null};

    const exampleTemplateMap: TemplateMap = {Color: ""};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual("[Single Color]")
})


test("correct value is substituted if predicate is false", () => {
    const CODE = {$if: '!parameters.Color', true: '[Single Color]', false: "red"};

    const exampleTemplateMap: TemplateMap = {Color: "true"};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual("red")
})


test("correct value substituted if predicate is false and no corresponding value specified", () => {
    const CODE = {$if: '!parameters.Color', true: '[Single Color]'};

    const exampleTemplateMap: TemplateMap = {Color: "true"}

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual(null)
})


test("old syntax", () => {
    const CODE = {$cond: {query: '!parameters.Color', true: '[Single Color]', false: "red"}};

    const exampleTemplateMap: TemplateMap = {Color: ""};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual("[Single Color]")

    const exampleTemplateMap1: TemplateMap = {Color: "true"};

    expect(applyConditionals(exampleTemplateMap1)(CODE)).toEqual("red")
})


test("array", () => {
    const CODE = {
        foo: [
            {$if: '!parameters.Color', true: '[Single Color]', false: "red"},
            {$if: 'parameters.Color', true: '[Single Color]', false: "red"}
        ]
    };

    const exampleTemplateMap: TemplateMap = {Color: ""};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual({foo: ["[Single Color]", "red"]})
})

test("array with old syntax", () => {
    const CODE = {
        foo: [
            {$cond: {query: '!parameters.Color', true: '[Single Color]', false: "red"}},
            {$cond: {query: 'parameters.Color', true: '[Single Color]', false: "red"}}
        ]
    };

    const exampleTemplateMap: TemplateMap = {Color: ""};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual({foo: ["[Single Color]", "red"]})
})

test("object properties are conditionals with old syntax", () => {

    const CODE = {
        foo: {
            bar: {$cond: {query: '!parameters.Color', true: '[Single Color]', false: "red"}},
            baz: {$cond: {query: 'parameters.Color', true: '[Single Color]', false: "red"}}
        }
    };

    const exampleTemplateMap: TemplateMap = {Color: ""}

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual({
        foo: {
            bar: "[Single Color]",
            baz: "red"
        }
    })
})


test("object properties are conditionals with new syntax", () => {

    const CODE = {
        foo: {
            bar: {$if: '!parameters.Color', true: '[Single Color]', false: "red"},
            baz: {$if: 'parameters.Color', true: '[Single Color]', false: "red"}
        }
    };

    const exampleTemplateMap: TemplateMap = {Color: ""};

    expect(applyConditionals(exampleTemplateMap)(CODE)).toEqual({
        foo: {
            bar: "[Single Color]",
            baz: "red"
        }
    })
})