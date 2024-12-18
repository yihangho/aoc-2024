import { ascend, BinaryHeap } from '@std/data-structures';

enum Direction {
  Up, Down, Left, Right,
}

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

  equals(other: Point): boolean {
    return this.i === other.i && this.j === other.j;
  }

  toString(): string {
    return `${this.i},${this.j}`;
  }
}

class Grid {
  constructor(public data: ReadonlyArray<ReadonlyArray<string>>) {

  }

  at(point: Point): string {
    return this.data[point.i][point.j];
  }
}

class Input {
  constructor(public grid: Grid, public start: Point, public end: Point) {

  }
}

class CustomMap<K, V> {
  private data = new Map<string, [K, V]>();

  constructor(private keyFn: (value: K) => string) {

  }

  get(key: K): V | undefined {
    const keyStr = this.keyFn(key);
    return this.data.get(keyStr)?.[1];
  }

  set(key: K, value: V) {
    const keyStr = this.keyFn(key);
    this.data.set(keyStr, [key, value]);
  }

  has(key: K): boolean {
    const keyStr = this.keyFn(key);
    return this.data.has(keyStr);
  }

  keys(): Array<K> {
    return [...this.data.values()].map(([k, _v]) => k);
  }

  get size(): number {
    return this.data.size;
  }
}

class CustomSet<T> {
  private data: CustomMap<T, number>;

  constructor(keyFn: (value: T) => string) {
    this.data = new CustomMap<T, number>(keyFn);
  }

  add(value: T) {
    this.data.set(value, 1);
  }

  values(): Array<T> {
    return this.data.keys();
  }

  get size(): number {
    return this.data.size;
  }
}

function parseInput(input: string): Input {
  let start: Point | null = null;
  let end: Point | null = null;

  const gridData = input.split('\n')
    .map((row, i) => {
      return row.split('').map((ch, j) => {
        if (ch == 'S') {
          start = new Point(i, j);
          return '.';
        }

        if (ch == 'E') {
          end = new Point(i, j);
          return '.';
        }

        return ch;
      });
    });

  if (start == null || end == null) {
    throw new Error(`start or end not found`);
  }

  return new Input(
    new Grid(gridData),
    start,
    end,
  );
}

interface State {
  distance: number;
  point: Point;
  direction: Direction;
}

function serializeState(s: State): string {
  return `${s.distance}|${s.point.toString()}|${s.direction}`;
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

function turn(direction: Direction): Array<Direction> {
  if (direction === Direction.Up || direction === Direction.Down) {
    return [Direction.Left, Direction.Right];
  } else {
    return [Direction.Up, Direction.Down];
  }
}

function countTilesInBestPaths(input: Input, distanceToEnd: number, parentsOf: CustomMap<State, CustomSet<State>>): number {
  const reachableStates: Array<State> = [];
  const addToReachableStates = once(
    (s: State) => reachableStates.push(s),
    serializeState,
  );

  addToReachableStates({distance: distanceToEnd, point: input.end, direction: Direction.Up});
  addToReachableStates({distance: distanceToEnd, point: input.end, direction: Direction.Down});
  addToReachableStates({distance: distanceToEnd, point: input.end, direction: Direction.Left});
  addToReachableStates({distance: distanceToEnd, point: input.end, direction: Direction.Right});

  const reachablePoints = new CustomSet<Point>(pt => pt.toString());

  for (let i = 0; i < reachableStates.length; i += 1) {
    reachablePoints.add(reachableStates[i].point);

    parentsOf.get(reachableStates[i])?.values().forEach((parentState) => addToReachableStates(parentState));
  }

  return reachablePoints.size;
}

function solve(input: Input): [number, number] {
  const pq = new BinaryHeap<State>((a, b) => ascend(a.distance, b.distance));
  const addToPq = once(
    (s: State) => pq.push(s),
    (s: State) => `${s.point.toString()}|${s.direction}`,
  );

  const parentsOf = new CustomMap<State, CustomSet<State>>(serializeState);

  function enqueue(from: State, to: State) {
    addToPq(to);

    if (!parentsOf.has(to)) {
      parentsOf.set(to, new CustomSet<State>(serializeState));
    }

    parentsOf.get(to)!.add(from);
  }

  addToPq({distance: 0, point: input.start, direction: Direction.Right});

  let distanceToEnd: number | null = null;

  while (!pq.isEmpty()) {
    const state = pq.pop()!;
    if (state.point.equals(input.end)) {
      distanceToEnd = state.distance;
      break;
    }

    turn(state.direction).forEach((direction) => enqueue(state, {
      distance: state.distance + 1000,
      point: state.point,
      direction,
    }));

    const nextPoint = state.point.move(state.direction);
    if (input.grid.at(nextPoint) !== '#') {
      enqueue(state, {
        distance: state.distance + 1,
        point: nextPoint,
        direction: state.direction,
      });
    }
  }

  if (distanceToEnd == null) {
    throw new Error("Did not reach the end point");
  }

  return [distanceToEnd, countTilesInBestPaths(input, distanceToEnd, parentsOf)];
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solve((input)));
}
