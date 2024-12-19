import fs from 'fs'
import path from 'path'

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
      b = b ^ operand
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
      b = b ^ c
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
