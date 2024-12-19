import fs from 'fs'
import path from 'path'
import * as R from 'ramda'

type TRegisters = {
  a: number
  b: number
  c: number
}

type TInstruction = {
  opcode: number
  operand: number
}

type TInstructionResult = {
  registers: TRegisters
  instructionPointer: number
  output: number | undefined
}

const valueOfComboOperand = (
  operand: number,
  registers: TRegisters
): number => {
  switch (operand) {
    case 0:
    case 1:
    case 2:
    case 3:
      return operand
    case 4:
      return registers.a
    case 5:
      return registers.b
    case 6:
      return registers.c
    case 7:
    default:
      throw new Error(`invalid combo operand ${operand}`)
  }
}

const runInstruction = (
  currentRegisters: TRegisters,
  currentInstructionPointer: number,
  instruction: TInstruction
): TInstructionResult => {
  let {a, b, c} = currentRegisters
  let newInstructionPointer = currentInstructionPointer + 2
  let {opcode, operand} = instruction
  let output: number | undefined = undefined

  switch (opcode) {
    case 0:
      a = Math.trunc(a / Math.pow(2, valueOfComboOperand(operand, currentRegisters)))
      break
    case 1:
      // BigInt is necessary for part 2 because JS's XOR does 32-bit operations
      // on regular numbers, for whatever reason, and part 2's numbers get large
      b = Number(BigInt(b) ^ BigInt(operand))
      break
    case 2:
      b = valueOfComboOperand(operand, currentRegisters) % 8
      break
    case 3:
      if (a !== 0) {
        newInstructionPointer = operand
      }
      break
    case 4:
      b =  Number(BigInt(b) ^ BigInt(c))
      break
    case 5:
      output = valueOfComboOperand(operand, currentRegisters) % 8
      break
    case 6:
      b = Math.trunc(a / Math.pow(2, valueOfComboOperand(operand, currentRegisters)))
      break
    case 7:
      c = Math.trunc(a / Math.pow(2, valueOfComboOperand(operand, currentRegisters)))
      break
    default:
      throw new Error(`invalid opcode ${opcode}`)
  }
  return {
    registers: {a, b, c},
    instructionPointer: newInstructionPointer,
    output,
  }
}

const input = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n').filter(line => line.trim() !== '')

const initialRegisters: TRegisters = {
  a: Number(input[0]!.split(': ')[1]!),
  b: Number(input[1]!.split(': ')[1]!),
  c: Number(input[2]!.split(': ')[1]!),
}

const program: number[] =
  input[3]!.split(': ')[1]!.split(',').map(Number)

const part1 = () => {
  let instructionPointer = 0
  let outputs: number[] = []
  let registers = {...initialRegisters}

  while (instructionPointer < program.length - 1) {
    const result = runInstruction(
      registers,
      instructionPointer,
      {opcode: program[instructionPointer]!, operand: program[instructionPointer + 1]!}
    )
    registers = result.registers
    instructionPointer = result.instructionPointer
    result.output !== undefined && outputs.push(result.output)
  }

  console.log('part 1:', outputs.join(','))
}

part1()

const part2 = () => {
  let initialA = 0
  let topOutputMatchCount = 0
  let hexIncrementer = 0

  while (true) {
    let instructionPointer = 0
    let outputs: number[] = []

    // I brute-forced my way for quite a long time through lower-value As,
    // leaving that running while I watched TV and tried to figure out the pattern.
    // As the output got closer (ish) to the desired program, I started
    // looking for patterns in the A values that were producing longer matching outputs.
    // This was taking forever and the patterns I was seeing weren't leading me to answers.
    //
    // At a certain point, I finally looked for hints and realized that each "closer"
    // answer I was observing was adding bits to the front of a _hex_ number. I had been
    // observing them in decimal. Observing these for patterns was on the right track,
    // given I had settled on brute forcing it, but not in decimal :(
    //
    // I also should have realized earlier that the computer we implemented here was doing
    // math on 3 bits at a time, and the bit shifting right the program does in a loop
    // means only the top bits of the starting A value affect the later outputs.
    //
    // By then, I realized my somewhat-optimized* brute forcing had settled on several hex
    // digits already. Starting from that closer point, knowing I only need a little more work
    // at the left of the hex number I'd come up with so far, I could just see patterns emerge
    // and update my starting point/lower digits and restart the program.

    // *via a few rounds of the patterns I'd noticed, I was e.g. testing every 1,048,576th number
    // (with an offset) for a bit, and then 4,194,304th, which I only later realized were
    // 0x100000 and 0x400000 -_-)

    // I didn't start this far down, but this is the gist:
    // initialA = Number('0x' + ((hexIncrementer).toString(16)+'2a2a')) // notice '68' is part of the solution
    // initialA = Number('0x' + ((hexIncrementer).toString(16)+'682a2a')) // notice a24 is part of the solution
    initialA = Number('0x' + ((hexIncrementer).toString(16)+'a24682a2a'))
    hexIncrementer += 1

    let registers = {...initialRegisters, a: initialA}

    while (instructionPointer < program.length - 1 && R.equals(outputs, program.slice(0, outputs.length))) {
      const result = runInstruction(
        registers,
        instructionPointer,
        {opcode: program[instructionPointer]!, operand: program[instructionPointer + 1]!}
      )
      registers = result.registers
      instructionPointer = result.instructionPointer
      result.output !== undefined && outputs.push(result.output)
    }

    if (R.equals(outputs, program)) {
      break
    } else {
      if (outputs.length > 8 && outputs.length >= topOutputMatchCount) {
        console.log('Equally or better match found at A=', initialA.toString(16), ': ', outputs)
        topOutputMatchCount = Math.max(outputs.length, topOutputMatchCount)
      }
    }
  }
  console.log('part 2:', initialA)
}

part2()
