import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import {isInteger} from 'ramda-adjunct'

// the raw text from https://adventofcode.com/2024/day/13/input
const machineDescriptionsStr: string[] = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n\n')

type MachineConfig = {
  buttonA: {x: number, y: number}
  buttonB: {x: number, y: number}
  prize:   {x: number, y: number}
}

const getX = (s: string) => Number(s.match(/X[=+](\d+)/)![1]!)
const getY = (s: string) => Number(s.match(/Y[=+](\d+)/)![1]!)

const machineConfigs: MachineConfig[] = machineDescriptionsStr.map(descStr => {
  const [a, b, prize] = descStr.split('\n') as [string, string, string]
  return {
    buttonA: {x: getX(a), y: getY(a)},
    buttonB: {x: getX(b), y: getY(b)},
    prize: {x: getX(prize), y: getY(prize)},
  }
})

const solveSystem = ({buttonA, buttonB, prize: p}: MachineConfig, adjustPrizeBy: number) => {
  const prize = {x: p.x + adjustPrizeBy, y: p.y + adjustPrizeBy}
  const bPresses = (prize.y * buttonA.x - prize.x * buttonA.y) / (buttonB.y * buttonA.x - buttonB.x * buttonA.y)
  const aPresses = (prize.x - (bPresses * buttonB.x)) / buttonA.x

  return isInteger(aPresses) && isInteger(bPresses)
    ? {aPresses, bPresses, cost: (aPresses * 3) + bPresses}
    : undefined
}

console.log('part 1:', R.sum(machineConfigs.map(mc => {
  const solved = solveSystem(mc, 0)
  return solved?.cost ?? 0
})))

console.log('part 2:', R.sum(machineConfigs.map(mc => {
  const solved = solveSystem(mc, 10000000000000)
  return solved?.cost ?? 0
})))

/**
 * (aPresses * buttonA.x) + (bPresses * buttonB.x) = prize.x
 * (aPresses * buttonA.y) + (bPresses * buttonB.y) = prize.y
 *
 * solving for aPresses in the first equation:
 * aPresses = [ prize.x - (bPresses * buttonB.x) ] / buttonA.x
 *
 * then substitute into the second:
 * ((prize.x - (bPresses * buttonB.x)) / buttonA.x * buttonA.y) + (bPresses * buttonB.y) = prize.y
 *
 * and solve for bPresses:
 * bPresses = (prize.y * buttonA.x - prize.x * buttonA.y) / (buttonB.y * buttonA.x - buttonB.x * buttonA.y)
 */
