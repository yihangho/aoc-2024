class Equation {
  constructor(public target: number, public terms: ReadonlyArray<number>) {
  }
}

function parseInput(input: string): Array<Equation> {
  return input.split("\n")
    .map((line) => {
      const [targetStr, termsStr] = line.split(": ");
      const target = parseInt(targetStr);
      const terms = termsStr.split(" ").map(termStr => parseInt(termStr));
      return new Equation(target, terms);
    })
}

type Operation = (a: number, b: number) => number;

function add(a: number, b: number): number {
  return a + b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function concat(a: number, b: number): number {
  return parseInt(`${a}${b}`);
}

function solve(input: ReadonlyArray<Equation>, operations: ReadonlyArray<Operation>): number {
  return input
    .filter((equation) => {
      function canBalance(acc: number, idx: number): boolean {
        if (acc > equation.target) {
          return false;
        }

        if (idx >= equation.terms.length) {
          return acc === equation.target;
        }

        return operations.some(op => canBalance(op(acc, equation.terms[idx]), idx + 1));
      }
      return canBalance(equation.terms[0], 1);
    })
    .map((equation) => equation.target)
    .reduce((a, b) => a + b);
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solve(input, [add, multiply]));
  console.log(solve(input, [add, multiply, concat]));
}
