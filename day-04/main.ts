export function add(a: number, b: number): number {
  return a + b;
}


class Point {
  i: number;
  j: number;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }
}

class Grid {
  data: ReadonlyArray<string>

  constructor(data: ReadonlyArray<string>) {
    this.data = data;
  }

  at(point: Point): string {
    return this.data[point.i][point.j];
  }

  forEach(fn: (val: string, point: Point) => void) {
    for (let i = 0; i < this.data.length; i += 1) {
      for (let j = 0; j < this.data[i].length; j += 1) {
        const point = new Point(i, j);
        fn(this.at(point), point);
      }
    }
  }

  isValidPoint(point: Point): boolean {
    return 0 <= point.i && point.i < this.data.length && 0 <= point.j && point.j < this.data[point.i].length;
  }
}

function makeSequence(point: Point, deltas: ReadonlyArray<[number, number]>): Array<Point> {
  return deltas.map(([di, dj]) => new Point(point.i + di, point.j + dj));
}

function solvePart1(grid: Grid): number {
  const DELTAS: ReadonlyArray<ReadonlyArray<[number, number]>> = [
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 0], [0, -1], [0, -2], [0, -3]],
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[0, 0], [-1, 0], [-2, 0], [-3, 0]],
    [[0, 0], [1, 1], [2, 2], [3, 3]],
    [[0, 0], [-1, -1], [-2, -2], [-3, -3]],
    [[0, 0], [1, -1], [2, -2], [3, -3]],
    [[0, 0], [-1, 1], [-2, 2], [-3, 3]],
  ];

  const TARGET = "XMAS".split("");

  let output = 0;

  grid.forEach((_val, point) => {
    DELTAS
      .map(deltas => makeSequence(point, deltas))
      .filter(sequence => sequence.every(pt => grid.isValidPoint(pt)))
      .forEach(sequence => {
        const isValid = sequence.every((pt, i) => grid.at(pt) === TARGET[i]);
        if (isValid) {
          output += 1;
        }
      })
  });

  return output;
}

function solvePart2(grid: Grid): number {
  const DELTAS: ReadonlyArray<[number, number]> = [
    [-1, -1], [-1, 1], [1, 1], [1, -1]
  ];

  const TARGETS = new Set(["MMSS", "SMMS", "SSMM", "MSSM"]);

  let output = 0;

  grid.forEach((val, point) => {
    if (val !== "A") {
      return;
    }

    const points = makeSequence(point, DELTAS)
    if (!points.every(pt => grid.isValidPoint(pt))) {
      return;
    }

    const representation = points.map(pt => grid.at(pt)).join("");
    if (TARGETS.has(representation)) {
      output += 1;
    }
  })

  return output;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const grid = new Grid(inputText.split('\n'));

  console.log(solvePart1(grid));
  console.log(solvePart2(grid));
}
