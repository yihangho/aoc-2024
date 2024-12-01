export function parseInput(input: string): [Array<number>, Array<number>] {
  const LINE_PATTERN = /^(\d+)\s+(\d+)$/;
  const left: Array<number> = [];
  const right: Array<number> = [];

  input
    .split("\n")
    .filter((line) => line !== "")
    .forEach((line) => {
      const match = LINE_PATTERN.exec(line)!;
      left.push(parseInt(match[1]));
      right.push(parseInt(match[2]));
    });

  return [left, right];
}

function solvePart1(
  left: ReadonlyArray<number>,
  right: ReadonlyArray<number>
): number {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();

  let answer = 0;
  for (let i = 0; i < leftSorted.length; i += 1) {
    answer += Math.abs(leftSorted[i] - rightSorted[i]);
  }
  return answer;
}

export function countFrequency<T>(
  input: ReadonlyArray<T>
): ReadonlyMap<T, number> {
  const output = new Map();

  input.forEach((val) => {
    const existingCount = output.get(val) ?? 0;
    output.set(val, existingCount + 1);
  });

  return output;
}

function solvePart2(
  left: ReadonlyArray<number>,
  right: ReadonlyArray<number>
): number {
  const rightFrequency = countFrequency(right);

  return left
    .map((val) => val * (rightFrequency.get(val) ?? 0))
    .reduce((a, b) => a + b);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const [left, right] = parseInput(inputText);

  console.log(solvePart1(left, right));
  console.log(solvePart2(left, right));
}
