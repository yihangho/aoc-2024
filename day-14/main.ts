let MAX_X: number;
let MAX_Y: number;

class Point {
  constructor(public x: number, public y: number) {

  }

  translate(vector: Vector): Point {
    return new Point(this.x + vector.x, this.y + vector.y);
  }

  wrap(): Point {
    return new Point(
      (this.x + MAX_X) % MAX_X,
      (this.y + MAX_Y) % MAX_Y,
    );
  }
}

class Vector {
  constructor(public x: number, public y: number) {

  }
}

class Robot {
  constructor(public position: Point, public velocity: Vector) {

  }

  clone(): Robot {
    return new Robot(this.position, this.velocity);
  }
}

function parseInput(input: string): Array<Robot> {
  const PATTERN = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/g;

  return [...input.matchAll(PATTERN)]
    .map((match) => new Robot(
      new Point(parseInt(match[1]), parseInt(match[2])),
      new Vector(parseInt(match[3]), parseInt(match[4])),
    ));
}

function solvePart1(input: ReadonlyArray<Robot>): number {
  const robots = input.map((robot) => robot.clone());

  for (let i = 0; i < 10000; i += 1) {
    robots.forEach((robot) => {
      robot.position = robot.position
        .translate(robot.velocity)
        .wrap();
    });
  }

  const X_MIDPOINT = Math.floor(MAX_X / 2);
  const Y_MIDPOINT = Math.floor(MAX_Y / 2);

  const counts = [0, 0, 0, 0];

  robots.forEach((robot) => {
    if (robot.position.x === X_MIDPOINT || robot.position.y === Y_MIDPOINT) {
      return;
    }

    let quadrant: number;
    if (robot.position.x < X_MIDPOINT) {
      quadrant = robot.position.y < Y_MIDPOINT ? 0 : 1;
    } else {
      quadrant = robot.position.y < Y_MIDPOINT ? 2 : 3;
    }

    counts[quadrant] += 1;
  });

  return counts.reduce((a, b) => a * b);
}

async function renderPart2(input: ReadonlyArray<Robot>, outputFile: Deno.FsFile) {
  const robots = input.map((robot) => robot.clone());

  for (let i = 0; i < 10000; i += 1) {
    robots.forEach((robot) => {
      robot.position = robot.position
        .translate(robot.velocity)
        .wrap();
    });

    if (i % 101 === 1) {
      await render(i + 1, robots, outputFile);
    }
  }
}

async function render(iteration: number, robots: ReadonlyArray<Robot>, outputFile: Deno.FsFile) {
  const grid: Array<Array<number>> = [];
  for (let i = 0; i < MAX_Y; i += 1) {
    const row = [];
    for (let j = 0; j < MAX_X; j += 1) {
      row.push(0);
    }
    grid.push(row);
  }

  robots.forEach((robot) => {
    grid[robot.position.y][robot.position.x] += 1;
  });

  const textEncoder = new TextEncoder();
  await outputFile.write(textEncoder.encode(`Iteration ${iteration}\n`));
  await outputFile.write(textEncoder.encode(
    grid.map((row) => row.map(x => x === 0 ? ' ' : `${x}`).join('')).join('\n')
  ));
  await outputFile.write(textEncoder.encode("\n=========================================================\n"));
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  if (inputFileName === 'input.txt') {
    MAX_X = 101;
    MAX_Y = 103
  } else {
    MAX_X = 11;
    MAX_Y = 7;
  }

  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));

  const outputFile = await Deno.create("output.txt");
  await renderPart2(input, outputFile);
  await outputFile.sync();
  outputFile.close();
}
