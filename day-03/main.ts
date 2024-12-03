export function add(a: number, b: number): number {
  return a + b;
}

function solvePart1(input: string): number {
  const PATTERN = /mul\((\d{1,3}),(\d{1,3})\)/g;

  return  [...input.matchAll(PATTERN)]
    .map(match => parseInt(match[1]) * parseInt(match[2]))
    .reduce((a, b) => a + b);
}

function solvePart2(input: string): number {
  const PATTERN = /(?:do\(\)|don't\(\)|mul\((\d{1,3}),(\d{1,3})\))/g;

  let output = 0;
  let shouldMultiply = true;
  for (const match of input.matchAll(PATTERN)) {
    if (match[0] === 'do()') {
      shouldMultiply = true;
      continue;
    }

    if (match[0] === "don't()") {
      shouldMultiply = false;
      continue;
    }

    if (!shouldMultiply) {
      continue;
    }

    output += parseInt(match[1]) * parseInt(match[2]);
  }

  return output;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const input = await Deno.readTextFile(inputFileName);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
