import { assertEquals } from "@std/assert";
import { parseInput, countFrequency } from "./main.ts";

Deno.test(function parseInputTest() {
  const input = "123  456\n321    654";
  assertEquals(parseInput(input), [
    [123, 321],
    [456, 654],
  ]);
});

Deno.test(function countFrequencyTest() {
  const input = [1, 3, 1, 2, 6, 1, 2];
  const expectedOutput = new Map();
  expectedOutput.set(1, 3);
  expectedOutput.set(2, 2);
  expectedOutput.set(3, 1);
  expectedOutput.set(6, 1);
  assertEquals(countFrequency(input), expectedOutput);
});
