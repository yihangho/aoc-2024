export function parseInput(input: string): Array<Array<number>> {
  return input.split("\n")
    .map(line => line.split(" ").map(x => parseInt(x)));
}

export function allPositive(input: ReadonlyArray<number>): boolean {
  return input.every(x => x > 0);
}

export function allNegative(input: ReadonlyArray<number>): boolean {
  return input.every(x => x < 0);
}

export function pairs<T>(input: ReadonlyArray<T>): Array<[T, T]> {
  const output: Array<[T, T]> = [];
  for (let i = 0; i + 1 < input.length; i += 1) {
    output.push([input[i], input[i + 1]]);
  }
  return output;
}

export function removeOneAtATime<T>(input: ReadonlyArray<T>): Array<Array<T>> {
  const output: Array<Array<T>> = [];

  for (let i = 0; i < input.length; i += 1) {
    const row: Array<T> = [];

    for (let j = 0; j < input.length; j += 1) {
      if (i === j) continue;
      row.push(input[j]);
    }

    output.push(row);
  }

  return output;
}

export function isSafe(levels: ReadonlyArray<number>): boolean {
  const deltas = pairs(levels).map(([a, b]) => b - a);

  return (allPositive(deltas) || allNegative(deltas)) && deltas.every(delta => Math.abs(delta) <= 3);
}

function solvePart1(input: ReadonlyArray<ReadonlyArray<number>>): number {
  return input
    .filter(levels => isSafe(levels))
    .length;
}

// Could be more efficient, but since each row is small, O(n^2) is no big deal
function solvePart2(input: ReadonlyArray<ReadonlyArray<number>>): number {
  return input
    .filter(levels => {
      return isSafe(levels) || removeOneAtATime(levels).some(x => isSafe(x));
    })
    .length;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
