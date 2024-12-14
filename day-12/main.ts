enum Direction {
  Up,
  Down,
  Left,
  Right,
}

class Point {
  constructor(public i: number, public j: number) {

  }

  neighbors(): Array<[Point, Direction]> {
    return [
      [new Point(this.i - 1, this.j), Direction.Up],
      [new Point(this.i + 1, this.j), Direction.Down],
      [new Point(this.i, this.j - 1), Direction.Left],
      [new Point(this.i, this.j + 1), Direction.Right],
    ];
  }

  toString(): string {
    return `${this.i},${this.j}`;
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

function solvePart1(input: Grid): number {
  let output = 0;
  const visited = new Set<string>();

  input.forEach((val, point) => {
    if (visited.has(point.toString())) {
      return;
    }

    visited.add(point.toString());

    let area = 0;
    let perimeter = 0;
    const frontier = [point];

    while (frontier.length > 0) {
      const pt = frontier.shift()!;
      area += 1;

      pt.neighbors().forEach(([neighbor]) => {
        if (input.isValidPoint(neighbor) && input.at(neighbor) === val) {
          if (!visited.has(neighbor.toString())) {
            visited.add(neighbor.toString());
            frontier.push(neighbor);
          }
        } else {
          perimeter += 1;
        }
      });
    }

    output += area * perimeter;
  });

  return output;
}

function solvePart2(input: Grid): number {
  let output = 0;
  const visited = new Set<string>();

  input.forEach((val, point) => {
    if (visited.has(point.toString())) {
      return;
    }

    visited.add(point.toString());

    let area = 0;
    const edges: Array<[Point, Direction]> = [];
    const frontier = [point];

    while (frontier.length > 0) {
      const pt = frontier.shift()!;
      area += 1;

      pt.neighbors().forEach(([neighbor, direction]) => {
        if (input.isValidPoint(neighbor) && input.at(neighbor) === val) {
          if (!visited.has(neighbor.toString())) {
            visited.add(neighbor.toString());
            frontier.push(neighbor);
          }
        } else {
          edges.push([neighbor, direction]);
        }
      });
    }

    edges.sort((a, b) => {
      if (a[1] !== b[1]) {
        return a[1] < b[1] ? -1 : 1;
      }

      if (a[1] === Direction.Up || a[1] === Direction.Down) {
        return a[0].i !== b[0].i
          ? a[0].i - b[0].i
          : a[0].j - b[0].j;
      } else {
        return a[0].j !== b[0].j
          ? a[0].j - b[0].j
          : a[0].i - b[0].i;
      }
    });

    let sides = 1;
    for (let i = 1; i < edges.length; i += 1) {
      const prevEdge = edges[i - 1];
      const edge = edges[i];


      if (prevEdge[1] !== edge[1]) {
        sides += 1;
        continue;
      }

      if (edge[1] === Direction.Left || edge[1] === Direction.Right) {
        if (edge[0].j === prevEdge[0].j && edge[0].i === prevEdge[0].i + 1) {
          continue;
        }
      }

      if (edge[1] === Direction.Up || edge[1] === Direction.Down) {
        if (edge[0].i === prevEdge[0].i && edge[0].j === prevEdge[0].j + 1) {
          continue;
        }
      }

      sides += 1;
    }

    output += area * sides;
  });

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
