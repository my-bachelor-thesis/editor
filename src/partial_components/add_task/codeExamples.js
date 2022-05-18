export let goTestExample = `package main

import "testing"

func TestMin(t *testing.T) {
\twant := 1
\tgot := Min(1, 2)
\tif got != want {
\t\tt.Errorf("IntMin(1, 2) = %d; want %d", got, want)
\t}
}`

export let goSolutionExample = `package main

func Min(a, b int) int {
    if a < b {
        return a
    }
    return b
}`

export let pythonTestExample = `def test_int_min():
    assert int_min(1, 2) == 1`

export let pythonSolutionExample = `def int_min(a, b):
    if a < b:
        return a
    return b`

export let javascriptTestExample = `var assert = require("assert")
describe("My test", function () {
  it("doing intMin(1, 2)", function () {
    assert.equal(intMin(1, 2), 2)
  })
})`

export let javascriptSolutionExample = `function intMin(a, b) {
  if (a < b)
    return a
  return b
}`

export let cppTestExample =`TEST_CASE("Comparing 1 and 2",) {
    REQUIRE(Min(1, 2) == 1);
}`

export let cppSolutionExample = `int Min(int a, int b) {
    return a < b ? a : b;
}`