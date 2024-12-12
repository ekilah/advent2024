import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import {compact} from '../../utils'

// this approach is naive for part 2. but for part 1, it was doable.

// the raw text from https://adventofcode.com/2024/day/11/input
const inputListStrings: string[] = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')[0]!.split(' ')

// full list of iterations per step for each stone in order of inputListStrings
const evolutions: (string[][])[] = inputListStrings.map(v => [[v]])

const evolve = (
  stone: string
): [string] | [string, string] => {
  if (stone === '0') {
    return ['1']
  } else if (stone.length % 2 === 0) {
    return [
      stone.slice(0, stone.length / 2),
      stone.slice(stone.length / 2),
    ].map(s => `${Number(s)}`) as [string, string]
  } else {
    return [`${2024 * Number(stone)}`]
  }
}

const n = 25

inputListStrings.forEach((initialStone, stoneIdx) => {
  R.times(step => {
    const currentStones = evolutions[stoneIdx]![step]!

    currentStones.forEach((stone) => {
      const val = compact(evolve(stone))
      if (evolutions[stoneIdx]![step+1]) {
        evolutions[stoneIdx]![step+1]!.push(...val)
      } else {
        evolutions[stoneIdx]![step+1] = val
      }
    })
  }, n)
})

console.log('part 1:', evolutions.map(e => e[n]!).flat().length)
