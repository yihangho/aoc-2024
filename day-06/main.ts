enum Direction {
  Up, Down, Left, Right
}

class Point {
  i: number;
  j: number;

  constructor(i: number, j: number) {
    this.i = i;
    this.j = j;
  }

  move(direction: Direction) {
    const displacement = Point.displacement(direction);
    return new Point(this.i + displacement.i, this.j + displacement.j);
  }

  toString(): string {
    return `${this.i},${this.j}`;
  }

  equals(other: Point): boolean {
    return this.i === other.i && this.j === other.j;
  }

  private static displacement(direction: Direction): Point {
    switch (direction) {
      case Direction.Up:
        return new Point(-1, 0);
      case Direction.Down:
        return new Point(1, 0);
      case Direction.Left:
        return new Point(0, -1);
      case Direction.Right:
        return new Point(0, 1);
    }
  }
}

class Grid {
  data: ReadonlyArray<string>;

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

  findIndex(target: string): Point | undefined {
    for (let i = 0; i < this.data.length; i += 1) {
      for (let j = 0; j < this.data[i].length; j += 1) {
        if (this.data[i][j] == target) {
          return new Point(i, j);
        }
      }
    }
  }

  isValidPoint(point: Point): boolean {
    return 0 <= point.i && point.i < this.data.length && 0 <= point.j && point.j < this.data[point.i].length;
  }
}

function turnRight(input: Direction): Direction {
  switch (input) {
    case Direction.Up:
      return Direction.Right;
    case Direction.Down:
      return Direction.Left;
    case Direction.Left:
      return Direction.Up;
    case Direction.Right:
      return Direction.Down;
  }
}

function solvePart1(grid: Grid): Array<Point> {
  let pos = grid.findIndex("^")!;
  let dir = Direction.Up;

  const visitedPos = new Set<string>();

  while (true) {
    visitedPos.add(pos.toString());

    const nextPos = pos.move(dir);

    if (!grid.isValidPoint(nextPos)) {
      break;
    }

    if (grid.at(nextPos) == "#") {
      dir = turnRight(dir);
      continue;
    }

    pos = nextPos;
  }

  return [...visitedPos].map(key => {
    const [i, j] = key.split(",").map(val => parseInt(val));
    return new Point(i, j);
  })
}

function solvePart2(grid: Grid, visitedPos: ReadonlyArray<Point>): number {
  const initPos = grid.findIndex("^")!;

  return visitedPos
    .filter((modifiedPos) => !initPos.equals(modifiedPos))
    .filter((modifiedPos) => {
      let pos = initPos;
      let dir = Direction.Up;
      const visitedStates = new Set();

      while (true) {
        const key = `${pos.toString()},${dir}`;
        if (visitedStates.has(key)) {
          return true;
        }

        visitedStates.add(key);

        const nextPos = pos.move(dir);

        if (!grid.isValidPoint(nextPos)) {
          break;
        }

        if (grid.at(nextPos) == "#" || modifiedPos.equals(nextPos)) {
          dir = turnRight(dir);
          continue;
        }

        pos = nextPos;
      }

      return false;
    })
    .length;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const grid = new Grid(inputText.split('\n'));

  const visitedPos = solvePart1(grid);
  console.log(visitedPos.length);
  console.log(solvePart2(grid, visitedPos));
}
