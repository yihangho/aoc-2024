import { List } from 'npm:immutable';

class Input {
  constructor(public a: number, public b: number, public c: number, public program: ReadonlyArray<number>) {

  }
}

class ExecutionState {
  public pc: number = 0;

  constructor(public a: number, public b: number, public c: number) {

  }

  executeStep(opcode: number, operand: number): number | null {
    this.pc += 2;

    let output: number | null = null;

    switch (opcode) {
      case 0: {
        this.adv(operand);
        break;
      }
      case 1: {
        this.bxl(operand);
        break;
      }
      case 2: {
        this.bst(operand);
        break;
      }
      case 3: {
        this.jnz(operand);
        break;
      }
      case 4: {
        this.bxc(operand);
        break;
      }
      case 5: {
        output = this.out(operand);
        break;
      }
      case 6: {
        this.bdv(operand);
        break;
      }
      case 7: {
        this.cdv(operand);
        break;
      }
      default: throw new Error(`Unknown opcode ${opcode}`);
    }

    return output;
  }

  adv(operand: number) {
    const numerator = this.a;
    const denominator = 2 ** this.resolveComboOperand(operand);
    this.a = Math.floor(numerator / denominator);
  }

  bxl(operand: number) {
    this.b = (this.b ^ operand)>>>0;
  }

  bst(operand: number) {
    this.b = this.resolveComboOperand(operand) % 8;
  }

  jnz(operand: number) {
    if (this.a === 0) {
      return;
    }

    this.pc = operand;
  }

  bxc(_operand: number) {
    this.b = (this.b ^ this.c)>>>0;
  }

  out(operand: number) {
    return this.resolveComboOperand(operand) % 8;
  }

  bdv(operand: number) {
    const numerator = this.a;
    const denominator = 2 ** this.resolveComboOperand(operand);
    this.b = Math.floor(numerator / denominator);
  }

  cdv(operand: number) {
    const numerator = this.a;
    const denominator = 2 ** this.resolveComboOperand(operand);
    this.c = Math.floor(numerator / denominator);
  }

  resolveComboOperand(operand: number) {
    switch (operand) {
      case 0:
      case 1:
      case 2:
      case 3:
        return operand;
      case 4:
        return this.a;
      case 5:
        return this.b;
      case 6:
        return this.c;
      case 7:
        throw new Error("Combo operand 7 found");
      default:
        throw new Error(`Combo operand out of bound: ${operand}`);
    }
  }
}

function parseInput(input: string): Input {
  const PATTERN = /Register A: (\d+)\nRegister B: (\d+)\nRegister C: (\d+)\n\nProgram: ([\d,]+)/;
  const match = input.match(PATTERN);

  if (match == null) {
    throw new Error("Failed to parse input");
  }

  return new Input(
    parseInt(match[1]),
    parseInt(match[2]),
    parseInt(match[3]),
    match[4].split(',').map(x => parseInt(x)),
  )
}

function solvePart1(input: Input): string {
  const state = new ExecutionState(input.a, input.b, input.c);
  const output: Array<number> = [];

  while (state.pc < input.program.length) {
    const opcode = input.program[state.pc];
    const operand = input.program[state.pc + 1];

    const stepOutput = state.executeStep(opcode, operand);
    if (stepOutput != null) {
      output.push(stepOutput);
    }
  }

  return output.join(',');
}

function initializeBitsList(): List<number | null> {
  const arr: Array<number | null> = [];
  for (let i = 0; i < 48; i += 1) {
    arr.push(null);
  }
  return List<number | null>(arr);
}

function solvePart2(input: Input): number {
  const bits = initializeBitsList();

  function helper(idx: number, bits: List<number | null>): number {
    if (idx >= input.program.length) {
      return numberFromBits(bits);
    }

    const val = input.program[idx];
    const bOffset = 3 * idx;
    let output = Number.MAX_SAFE_INTEGER;
    for (let b = 0; b < 8; b += 1) {
      const c = val ^ b ^ 0b101;
      const cOffset = bOffset + (b ^ 1);

      let nextBits = bits;
      if (!isConsistent(b, bOffset, nextBits)) {
        continue;
      }

      nextBits = update(b, bOffset, nextBits);

      if (!isConsistent(c, cOffset, nextBits)) {
        continue;
      }

      nextBits = update(c, cOffset, nextBits);

      output = Math.min(output, helper(idx + 1, nextBits));
    }

    return output;
  }

  return helper(0, bits);
}

function isConsistent(val: number, offset: number, bits: List<number | null>): boolean {
  for (let i = 0; i < 3; i += 1) {
    const bit = bits.get(offset + i);
    if (bit != null && bit !== getBit(val, i)) {
      return false;
    }

    if (getBit(val, i) === 1 && offset + i >= bits.size) {
      return false;
    }
  }

  return true;
}

function update(val: number, offset: number, bits: List<number | null>): List<number | null> {
  return bits
    .set(offset, getBit(val, 0))
    .set(offset + 1, getBit(val, 1))
    .set(offset + 2, getBit(val, 2));
}

function getBit(val: number, idx: number): number {
  return (val >> idx) & 0b1;
}

function numberFromBits(bits: List<number | null>): number {
  let output = 0;
  for (let i = 0; i < bits.size; i += 1) {
    const bit = bits.get(i);
    if (bit !== 1) {
      continue;
    }

    output += 2 ** i;
  }
  return output;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = parseInput(inputText);

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
