let SIZE: number;
let CORRUPTED_BYTES: number;

class Point {
  constructor(public i: number, public j: number) {

  }

  neighbors(): Array<Point> {
    return [
      new Point(this.i - 1, this.j),
      new Point(this.i + 1, this.j),
      new Point(this.i, this.j - 1),
      new Point(this.i, this.j + 1),
    ];
  }

  toString(): string {
    return `${this.i},${this.j}`;
  }
}

class Grid {
  public data: Array<Array<string>>;

  constructor(size: number) {
    this.data = [];
    for (let i = 0; i < size; i += 1) {
      const row: Array<string> = [];
      this.data.push(row);
      for (let j = 0; j < size; j += 1) {
        row.push('.');
      }
    }
  }

  set(point: Point, value: string) {
    this.data[point.i][point.j] = value;
  }

  at(point: Point): string {
    return this.data[point.i][point.j];
  }

  isValidPoint(point: Point): boolean {
    return 0 <= point.i && point.i < this.data.length && 0 <= point.j && point.j < this.data[point.i].length;
  }
}

function parseInput(input: string): Array<Point> {
  return input
    .split('\n')
    .map((line) => {
      const [j, i] = line.split(',').map((x) => parseInt(x));
      return new Point(i, j);
    });
}

interface State {
  distance: number;
  point: Point;
}

function once<T>(fn: (input: T) => void, keyFn: (input: T) => string): (input: T) => void {
  const set = new Set<string>();

  return (input: T) => {
    const key = keyFn(input);
    if (set.has(key)) {
      return;
    }

    set.add(key);
    fn(input);
  };
}

function findDistanceToTarget(input: ReadonlyArray<Point>, corruptedBytes: number): number | null {
  const grid = new Grid(SIZE);
  for (let i = 0; i < corruptedBytes; i += 1) {
    grid.set(input[i], '#');
  }

  const frontier: Array<State> = [];

  const push = once(
    (state: State) => frontier.push(state),
    (state: State) => state.point.toString(),
  );

  push({
    distance: 0,
    point: new Point(0, 0),
  });

  while (frontier.length > 0) {
    const state = frontier.shift()!;

    if (state.point.i === SIZE - 1 && state.point.j === SIZE - 1) {
      return state.distance;
    }

    state.point.neighbors()
      .filter((neighbor) => grid.isValidPoint(neighbor) && grid.at(neighbor) === '.')
      .forEach((neighbor) => push({
        distance: state.distance + 1,
        point: neighbor,
      }));
  }

  return null;
}

function solvePart1(input: ReadonlyArray<Point>): number {
  const distance = findDistanceToTarget(input, CORRUPTED_BYTES);

  if (distance == null) {
    throw new Error("Did not reach end point");
  }

  return distance;
}

function solvePart2(input: ReadonlyArray<Point>): string {
  let lo = 0, hi = input.length - 1;
  let answer: number | null = null;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const distance = findDistanceToTarget(input, mid + 1);

    if (distance == null) {
      hi = mid - 1;
      answer = mid;
    } else {
      lo = mid + 1;
    }
  }

  if (answer == null) {
    throw new Error("Did not find the first blocking coordinates");
  }

  return `${input[answer].j},${input[answer].i}`;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  if (inputFileName === 'input.txt') {
    SIZE = 71;
    CORRUPTED_BYTES = 1024;
  } else {
    SIZE = 7;
    CORRUPTED_BYTES = 12;
  }

  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
