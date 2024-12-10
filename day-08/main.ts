class Point {
  constructor(public i: number, public j: number) {

  }

  vectorTo(other: Point): Vector {
    return new Vector(other.i - this.i, other.j - this.j);
  }

  translate(vector: Vector): Point {
    return new Point(this.i + vector.i, this.j + vector.j);
  }

  toString(): string {
    return `${this.i},${this.j}`;
  }
}

class Vector {
  constructor(public i: number, public j: number) {

  }

  scale(factor: number): Vector {
    return new Vector(this.i * factor, this.j * factor);
  }

  toRelativelyPrime(): Vector {
    const commonDivisor = gcd(this.i, this.j);
    return this.scale(1 / commonDivisor);
  }
}

class Grid {
  constructor(public data: ReadonlyArray<string>) {

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

class Input {
  constructor(
    public grid: Grid,
    public nodes: ReadonlyMap<string, ReadonlyArray<Point>>,
  ) {

  }
}

function insert<K, V>(m: Map<K, Array<V>>, key: K, value: V) {
  if (!m.has(key)) {
    m.set(key, []);
  }
  m.get(key)!.push(value);
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function parseInput(input: string): Input {

  const grid = new Grid(input.split('\n'));
  const nodes = new Map();

  grid.forEach((ch, pt) => {
    if (ch !== '.') {
      insert(nodes, ch, pt);
    }
  });

  return new Input(grid, nodes);
}

function solvePart1(input: Input): number {
  const antinodes = new Set<string>();

  [...input.nodes.values()].forEach(group => {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const p1 = group[i];
        const p2 = group[j];

        [-1, 2]
          .map((factor) => p1.vectorTo(p2).scale(factor))
          .map((translation) => p1.translate(translation))
          .filter((point) => input.grid.isValidPoint(point))
          .map((point) => point.toString())
          .map((pointStr) => antinodes.add(pointStr));
      }
    }
  })

  return antinodes.size;
}

function solvePart2(input: Input): number {
  const antinodes = new Set<string>();

  [...input.nodes.values()].forEach(group => {
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const p1 = group[i];
        const p2 = group[j];
        const v = p1.vectorTo(p2).toRelativelyPrime();

        for (const direction of [-1, 1]) {
          let f = 0;
          while (true) {
            const p = p1.translate(v.scale(f * direction));
            if (!input.grid.isValidPoint(p)) {
              break;
            }

            antinodes.add(p.toString());
            f += 1;
          }
        }
      }
    }
  })

  return antinodes.size;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
