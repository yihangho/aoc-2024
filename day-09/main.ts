function append<T>(array: Array<T>, count: number, value: T) {
  for (let i = 0; i < count; i += 1) {
    array.push(value);
  }
}

function solvePart1(input: ReadonlyArray<number>): number {
  const buffer: Array<number | null> = [];

  input.forEach((val, idx) => {
    append(buffer, val, idx % 2 === 0 ? idx / 2 : null);
  });

  let i = 0, j = buffer.length - 1;

  while (i < j) {
    if (buffer[i] != null) {
      i += 1;
      continue;
    }

    if (buffer[j] == null) {
      j -= 1;
      continue;
    }

    buffer[i] = buffer[j];
    buffer[j] = null;

    i += 1;
    j -= 1;
  }

  return buffer
    .map((val, idx) => (val ?? 0) * idx)
    .reduce((a, b) => a + b);
}

class FreeList {
  private slots: Array<Array<number>>;

  constructor(maxSize: number) {
    this.slots = [];

    for (let i = 0; i <= maxSize; i += 1) {
      this.slots.push([]);
    }
  }

  add(size: number, idx: number) {
    this.slots[size].push(idx);
  }

  findSlot(size: number, beforeIdx: number): number | null {
    let targetSize: number | null = null;
    for (let s = size; s < this.slots.length; s += 1) {
      if (this.slots[s].length === 0) {
        continue;
      }

      if (this.slots[s][0] >= beforeIdx) {
        continue;
      }

      if (targetSize == null || this.slots[s][0] < this.slots[targetSize][0]) {
        targetSize = s;
      }
    }

    if (targetSize == null) {
      return null;
    }

    const output = this.slots[targetSize].shift()!;

    if (targetSize > size) {
      const leftoverSize = targetSize - size;
      this.slots[leftoverSize].push(output + size);
      this.slots[leftoverSize].sort((a, b) => a - b);
    }

    return output;
  }
}

function solvePart2(input: ReadonlyArray<number>): number {
  let currentIdx = 0;
  const freeList = new FreeList(9);
  // map from file index to position in the buffer
  const filePos: Array<number> = [];

  input.forEach((val, idx) => {
    if (idx % 2 === 0) {
      filePos.push(currentIdx);
    } else {
      freeList.add(val, currentIdx);
    }

    currentIdx += val;
  });

  let output = 0;
  for (let i = filePos.length - 1; i >= 0; i -= 1) {
    const size = input[2 * i];
    const newIdx = freeList.findSlot(size, filePos[i]) ?? filePos[i];

    const checksum = i * (size * newIdx + (size - 1) * size / 2);
    output += checksum;
  }

  return output;
}

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const inputFileName = Deno.args[0] ?? "input.txt";
  const inputText = await Deno.readTextFile(inputFileName);
  const input = inputText.trim().split('').map(ch => parseInt(ch));

  console.log(solvePart1(input));
  console.log(solvePart2(input));
}
