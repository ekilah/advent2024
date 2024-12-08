import * as R from 'ramda'
import fs from 'fs'
import path from 'path'
import * as M from '../../utils/Map'

/*
can the left number be produced by some combination of left-to-right (not PEMDAS)
additions and/or multiplications?

190: 10 19
3267: 81 40 27
83: 17 5
156: 15 6
7290: 6 8 6 15
161011: 16 10 13
192: 17 8 14
21037: 9 7 18 13
292: 11 6 16 20

(190, 3267, and 292 can)

part 2 adds string concatenations as an operation

(152, 7290, and 192 become solutions too)

*/

const lines = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')

const parseInput = (): Map<number, number[]> => {
  const tests: Map<number, number[]> = new Map()
  lines.forEach(line => {
    if (!line) return
    const [resultAsStr, valuesAsStr] = line.split(': ') as [string, string]
    const values = valuesAsStr.split(' ').map(str => Number(str))
    tests.set(Number(resultAsStr), values)
  })
  return tests
}

const tests = parseInput()

const go = (list: number[], target: number, allowConcat: boolean): boolean => {
  const last = list[list.length - 1]!
  const rest = list.slice(0, list.length - 1)
  if (rest.length === 0) {
    return last === target
  }

  return go(rest, target - last, allowConcat) ||
         go(rest, target / last, allowConcat) ||
         (allowConcat && `${target}`.endsWith(`${last}`) &&
           go(rest, Number(`${target}`.slice(0, -1 * `${last}`.length)), allowConcat)
         )
}

const successes1 = M.filter((list, target) => go(list, target, false), tests)
console.log('part 1:', R.sum(M.keys(successes1)))

const successes2 = M.filter((list, target) => go(list, target, true), tests)
console.log('part 2:', R.sum(M.keys(successes2)))
