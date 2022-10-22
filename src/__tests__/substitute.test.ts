import { setTemplateValues } from "..";

test("can substitute single value", () => {
    const x = setTemplateValues("[foo]", {foo: "bar"});
    expect(x).toEqual("bar");
})

test("can substitute single value enclosed in quotes", () => {
    const x = setTemplateValues('"[foo]?"', {foo: "bar"});
    expect(x).toEqual('"bar?"');
})

test("can substitute single value not enclosed in quotes", () => {
    const x = setTemplateValues('"[foo]"', {foo: "bar"});
    expect(x).toEqual('bar');
})

test("If value is not enclosed in quote marks, it will not be enclosed in quote marks after substitution", () => {
    // here parameter value '18' *does not* start and end with quotes
    const x = setTemplateValues('{ "a": [foo], "b": "[foo]" }', {foo: '18'});
    expect(x).toEqual('{ "a": 18, "b": 18 }');
})

test("if value contains quotation marks, whether is it inserted as a string depends on whether the template wraps the variable name in quote marks", () => {
    // here parameter value '"18"' *does* start and end with quotes
    const x = setTemplateValues('{ "a": [foo], "b": "[foo]" }', {foo: '"18"'});
    expect(x).toEqual('{ "a": 18, "b": "18" }');
})

test("can substitute multiple values", () => {
    const x = setTemplateValues("[foo] [bar] [baz]", {foo: "1", bar: "2", baz: "3"});
    expect(x).toEqual("1 2 3");
})
