class Point {
  constructor(public i: number, public j: number) {

  }

  move(direction: Direction): Point {
    switch (direction) {
      case Direction.Up: return new Point(this.i - 1, this.j);
      case Direction.Down: return new Point(this.i + 1, this.j);
      case Direction.Left: return new Point(this.i, this.j - 1);
      case Direction.Right: return new Point(this.i, this.j + 1);
    }
  }

  toString(): string {
    return `${this.i},${this.j}`;
  }
}

class Grid {
  constructor(public data: Array<Array<string>>) {

  }

  at(point: Point): string {
    return this.data[point.i][point.j];
  }

  set(point: Point, value: string) {
    this.data[point.i][point.j] = value;
  }

  forEach(fn: (val: string, point: Point) => void) {
    for (let i = 0; i < this.data.length; i += 1) {
      for (let j = 0; j < this.data[i].length; j += 1) {
        const point = new Point(i, j);
        fn(this.at(point), point);
      }
    }
  }

  clone(): Grid {
    return new Grid(
      this.data.map(row => [...row]),
    );
  }

  toString(): string {
    return this.data
      .map(row => row.join(''))
      .join('\n');
  }
}

class AddOnce<T> {
  private added = new Set<string>();
  data: Array<T> = [];

  constructor(private keyFn: (val: T) => string) {

  }

  push(input: T): boolean {
    const key = this.keyFn(input);
    if (this.added.has(key)) {
      return false;
    }

    this.added.add(key);
    this.data.push(input);
    return true;
  }
}

enum Direction {
  Up, Down, Left, Right
}

class Input {
  constructor(public grid: Grid, public initialPos: Point, public instructions: ReadonlyArray<Direction>) {

  }

  clone() {
    return new Input(this.grid.clone(), this.initialPos, this.instructions);
  }
}

function parseInput(input: string): Input {
  const [gridStr, instructionsStr] = input.split('\n\n');

  let initialPos: Point | null = null;
  const gridData = gridStr
    .split("\n")
    .map((row, i) => (
      row
        .split("")
        .map((ch, j) => {
          if (ch === '@') {
            initialPos = new Point(i, j);
            return '.';
          } else {
            return ch;
          }
        })
    ));

  if (initialPos == null) {
    throw new Error("Did not find initial position");
  }

  const grid = new Grid(gridData);

  const instructions = instructionsStr
    .replaceAll(/\s+/g, '')
    .split('')
    .map((ch) => {
      switch (ch) {
        case '^': return Direction.Up;
        case 'v': return Direction.Down;
        case '<': return Direction.Left;
        case '>': return Direction.Right;
        default: throw new Error(`Unknown instruction ${ch}`);
      }
    });

  return new Input(grid, initialPos, instructions);
}

function solvePart1(input: Input): number {
  let pos = input.initialPos;

  input.instructions.forEach((direction) => {
    let targetPos = pos.move(direction);
    while (input.grid.at(targetPos) === 'O') {
      targetPos = targetPos.move(direction);
    }

    if (input.grid.at(targetPos) === '#') {
      return;
    }

    const nextPos = pos.move(direction);
    input.grid.set(targetPos, input.grid.at(nextPos));
    input.grid.set(nextPos, '.');
    pos = nextPos;
  });

  let output = 0;
  input.grid.forEach((ch, point) => {
    if (ch === 'O') {
      output += 100 * point.i + point.j;
    }
  })

  return output;
}

function expandInput(input: Input): Input {
  return new Input(
    new Grid(
      input.grid.data.map((row) => (
        row.flatMap((ch) => {
          switch (ch) {
            case '#': return ['#', '#'];
            case 'O': return ['[', ']'];
            case '.': return ['.', '.'];
            default: throw new Error(`Unknown character ${ch}`);
          }
        })
      )),
    ),
    new Point(input.initialPos.i, 2 * input.initialPos.j),
    input.instructions,
  );
}

function solvePart2(input: Input): number {
  const expandedInput = expandInput(input);

  let pos = expandedInput.initialPos;

  /*
   * The high level strategy is quite simple: we perform a BFS to find all the boxes that will be
   * pushed. In this virtual graph, there is a node from u to v if the box at u will move into v
   * after the push. If, during the BFS, we run into a wall, it means that a box is pushed against
   * the wall, which means the push will not result in any change.
   *
   * Note that the choice of BFS is somewhat important. We store the order of traversal, and then
   * move the symbols in the grid in the reversed order. For e.g., if the order of traversal is
   * a -> b -> c. We will move c to c.move(direction), then b to c, then a to b. If the order of
   * the move is messed up, the end state will be wrong (e.g., if we move a to b first, then b to c
   * next, c will now be the symbol of what used to be a, instead of b. If another order of 
   * traversal is used (e.g., DFS), we will need to sort the positions before performing the move.
   */

  expandedInput.instructions.forEach((direction) => {
    const toMove = new AddOnce<Point>(pt => pt.toString());

    const toCheck = new AddOnce<Point>(pt => pt.toString());
    toCheck.push(pos.move(direction));

    while (toCheck.data.length > 0) {
      const posToCheck = toCheck.data.shift()!;
      const ch = expandedInput.grid.at(posToCheck);

      switch (ch) {
        case '#': return;
        case '.': continue;
        default: {
          // Where is the other bracket?
          const partnerPosToCheck = ch === '[' ? posToCheck.move(Direction.Right) : posToCheck.move(Direction.Left);
          
          toMove.push(posToCheck);
          toMove.push(partnerPosToCheck);
          toCheck.push(posToCheck.move(direction));
          toCheck.push(partnerPosToCheck.move(direction));
        }
      }
    }

    pos = pos.move(direction);

    for (let i = toMove.data.length - 1; i >= 0; i -= 1) {
      expandedInput.grid.set(toMove.data[i].move(direction), expandedInput.grid.at(toMove.data[i]));
      expandedInput.grid.set(toMove.data[i], '.');
    }
  });

  let output = 0;
  expandedInput.grid.forEach((ch, point) => {
    if (ch === '[') {
      output += 100 * point.i + point.j;
    }
  });
  return output;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input.clone()));
  console.log(solvePart2(input.clone()));
}
