class Point {
  static ORIGIN = new Point(0, 0);

  constructor(public i: number, public j: number) {

  }

  translate(vector: Vector): Point {
    return new Point(this.i + vector.i, this.j + vector.j);
  }

  equals(other: Point): boolean {
    return this.i === other.i && this.j === other.j;
  }
}

class Vector {
  constructor(public i: number, public j: number) {

  }

  scale(factor: number): Vector {
    return new Vector(this.i * factor, this.j * factor);
  }
}

class Machine {
  constructor(public a: Vector, public b: Vector, public target: Point) {

  }
}

function parseInput(input: string): Array<Machine> {
  const PATTERN = /Button A: X\+(\d+), Y\+(\d+)\nButton B: X\+(\d+), Y\+(\d+)\nPrize: X=(\d+), Y=(\d+)/g;

  return [...input.matchAll(PATTERN)]
    .map((match) => new Machine(
      new Vector(parseInt(match[1]), parseInt(match[2])),
      new Vector(parseInt(match[3]), parseInt(match[4])),
      new Point(parseInt(match[5]), parseInt(match[6])),
    ));
}

function solvePart1(input: ReadonlyArray<Machine>): number {
  return input
    .map((machine) => {
      let lowestCost: number | null = null;

      for (let i = 0; i <= 100; i += 1) {
        for (let j = 0; j <= 100; j += 1) {
          const destination = Point.ORIGIN
            .translate(machine.a.scale(i))
            .translate(machine.b.scale(j));

          if (destination.equals(machine.target)) {
            lowestCost = Math.min(lowestCost ?? Number.MAX_SAFE_INTEGER, 3 * i + j);
          }
        }
      }

      return lowestCost ?? 0;
    })
    .reduce((a, b) => a + b);
}

function solvePart2(input: ReadonlyArray<Machine>): number {
  const OFFSET = 10000000000000;

  return input
    .map((machine) => {
      // 1. Verified that, at least for my input, a and b are never parallel. If they are, the determinant would be 0.
      // 2. This is just that linear algebraic solution to a system of 2 equations with 2 unknowns.
      const ti = machine.target.i + OFFSET;
      const tj = machine.target.j + OFFSET;
      const determinant = machine.a.i * machine.b.j - machine.a.j * machine.b.i;

      const x = machine.b.j * ti - machine.b.i * tj;
      const y = machine.a.i * tj - machine.a.j * ti;
      if (x % determinant !== 0 || y % determinant !== 0) {
        return 0;
      }

      const xScaled = x / determinant;
      const yScaled = y / determinant;

      return 3 * xScaled + yScaled;
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
