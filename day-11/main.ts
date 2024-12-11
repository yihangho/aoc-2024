function transformOnce(input: number): Array<number> {
  if (input === 0) {
    return [1]
  }

  const str = `${input}`;
  if (str.length % 2 === 0) {
    return [
      parseInt(str.substring(0, str.length / 2)),
      parseInt(str.substring(str.length / 2)),
    ];
  }

  return [input * 2024];
}

function solvePart1(input: ReadonlyArray<number>): number {
  let stones = input;

  for (let i = 0; i < 25; i += 1) {
    const nextStones: Array<number> = [];

    stones.forEach((val) => {
      nextStones.push(...transformOnce(val));
    });

    stones = nextStones;
  }

  return stones.length;
}

function solvePart2(input: ReadonlyArray<number>): number {
  const dp = new Map<string, number>();

  function transform(val: number, times: number): number {
    if (times === 0) {
      return 1;
    }

    const key = `${val}:${times}`;
    if (dp.has(key)) {
      return dp.get(key)!;
    }

    const output = transformOnce(val)
      .map((transformed) => transform(transformed, times - 1))
      .reduce((a, b) => a + b);

    dp.set(key, output);
    return output;
  }

  return input
    .map((val) => transform(val, 75))
    .reduce((a, b) => a + b);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = inputText.trim().split(" ").map(val => parseInt(val));

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
