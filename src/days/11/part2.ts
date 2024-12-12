import fs from 'fs'
import path from 'path'
import * as R from 'ramda'

// the raw text from https://adventofcode.com/2024/day/11/input
const inputListStrings: string[] = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')[0]!.split(' ')

// memoize the result for a given depth & stone pair
// because at the larger depths, there are many, many repeated stone values at the same depths.
const cache: Record<`${number},${string}`, number> = {}

const blink = (
  stone: string,
  blinksRemaining: number
): number => {
  return cache[`${blinksRemaining},${stone}`] ||= (() => {
    if (blinksRemaining === 0) {
      return 1 // one stone down here!
    }

    if (stone === '0') {
      return blink('1', blinksRemaining - 1)
    } else if (stone.length % 2 === 0) {
      // to & from `Number` handles removing leading zeroes
      return (
        blink(`${Number(stone.slice(0, stone.length / 2))}`, blinksRemaining - 1) +
        blink(`${Number(stone.slice(stone.length / 2))}`, blinksRemaining - 1)
      )
    } else {
      return blink(`${2024 * Number(stone)}`, blinksRemaining - 1)
    }
  })()
}

console.log('part 1:', R.sum(inputListStrings.map(stone => blink(stone, 25))))
console.log('part 2:', R.sum(inputListStrings.map(stone => blink(stone, 75))))
