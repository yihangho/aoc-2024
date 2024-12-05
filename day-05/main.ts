export function add(a: number, b: number): number {
  return a + b;
}

class Input {
  rawPageOrderRules: ReadonlySet<string>;
  pageOrderRules: ReadonlyArray<[number, number]>;
  updates: ReadonlyArray<ReadonlyArray<number>>;

  constructor(
    rawPageOrderRules: ReadonlySet<string>,
    pageOrderRules: ReadonlyArray<[number, number]>,
    updates: ReadonlyArray<ReadonlyArray<number>>
  ) {
    this.rawPageOrderRules = rawPageOrderRules;
    this.pageOrderRules = pageOrderRules;
    this.updates = updates;
  }
}

function parseInput(input: string): Input {
  const [pageOrderRulesText, updatesText] = input.split("\n\n");

  const rawPageOrderRules = pageOrderRulesText.split("\n");
  const pageOrderRules = rawPageOrderRules.map(line => {
      const [first, second] = line.split("|").map(chunk => parseInt(chunk));
      return [first, second] as [number, number];
    })

  const updates = updatesText
    .split("\n")
    .map(line => {
      return line.split(",").map(chunk => parseInt(chunk));
    });

  return new Input(new Set(rawPageOrderRules), pageOrderRules, updates);
}

function buildReverseIndex<T>(input: ReadonlyArray<T>): ReadonlyMap<T, number> {
  const output = new Map<T, number>;

  input.forEach((val, idx) => {
    output.set(val, idx);
  })

  return output;
}

function solvePart1(input: Input): number {
  return input.updates
    .filter(update => {
      const reverseIndex = buildReverseIndex(update);
      return input.pageOrderRules
        .every(([first, second]) => (reverseIndex.get(first) ?? Number.MIN_SAFE_INTEGER) < (reverseIndex.get(second) ?? Number.MAX_SAFE_INTEGER));
    })
    .map(update => update[Math.floor(update.length / 2)])
    .reduce((a, b) => a + b);
}

function solvePart2(input: Input): number {
  return input.updates
    .filter(update => {
      const reverseIndex = buildReverseIndex(update);
      return !input.pageOrderRules
        .every(([first, second]) => (reverseIndex.get(first) ?? Number.MIN_SAFE_INTEGER) < (reverseIndex.get(second) ?? Number.MAX_SAFE_INTEGER));
    })
    .map(update => {
      const sorted = [...update].sort((a, b) => {
        const key = `${a}|${b}`;
        // We assume that the page order rules form a total order, i.e., for any two integers a, b in an update, exactly one of a|b or b|a is in the rules.
        return input.rawPageOrderRules.has(key) ? -1 : 1;
      });

      return sorted[Math.floor(sorted.length / 2)];
    })
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
