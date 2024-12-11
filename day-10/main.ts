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
  constructor(public data: ReadonlyArray<ReadonlyArray<number>>) {

  }

  at(point: Point): number {
    return this.data[point.i][point.j];
  }

  forEach(fn: (val: number, point: Point) => void) {
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

function calculateRating(input: Grid, startingPoint: Point): [number, number] {
  const peaks = new Set<string>();
  const paths = new Set<string>();

  const frontier = [[startingPoint]];

  while (frontier.length > 0) {
    const path = frontier.shift()!;
    const point = path[path.length - 1];
    const value = input.at(point);

    if (value === 9) {
      peaks.add(point.toString());
      paths.add(path.map(pt => pt.toString()).join(':'));
      continue;
    }

    point.neighbors()
      .filter(pt => input.isValidPoint(pt))
      .filter(pt => input.at(pt) === value + 1)
      .forEach(pt => frontier.push([...path, pt]));
  }

  return [peaks.size, paths.size];
}

function solve(input: Grid): [number, number] {
  let peaksRating = 0;
  let pathsRating = 0;

  input.forEach((val, point) => {
    if (val !== 0) {
      return;
    }

    const [peaks, paths] = calculateRating(input, point);
    peaksRating += peaks;
    pathsRating += paths;
  });

  return [peaksRating, pathsRating];
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = new Grid(
    inputText.split('\n')
      .map(line => line.split('').map(ch => parseInt(ch))),
  );

  console.log(solve(input));
}
