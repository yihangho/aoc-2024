class Input {
  constructor(public patterns: ReadonlyArray<string>, public designs: ReadonlyArray<string>) {

  }
}

function parseInput(input: string): Input {
  const [patterns, designs] = input.split("\n\n");

  return new Input(
    patterns.split(", "),
    designs.split("\n"),
  );
}

function countArrangements(design: string, patterns: ReadonlyArray<string>): number {
  const memo = new Map<number, number>();

  function helper(idx: number): number {
    if (idx >= design.length) {
      return 1;
    }

    if (memo.has(idx)) {
      return memo.get(idx)!;
    }

    const output = patterns
      .filter((pattern) => design.startsWith(pattern, idx))
      .map((pattern) => helper(idx + pattern.length))
      .reduce((a, b) => a + b, 0);

    memo.set(idx, output);

    return output;
  }

  return helper(0);
}

function solvePart1(input: Input): number {
  return input.designs
    .filter((design) => countArrangements(design, input.patterns) > 0)
    .length;
}

function solvePart2(input: Input): number {
  return input.designs
    .map((design) => countArrangements(design, input.patterns))
    .reduce((a, b) => a + b);

}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
