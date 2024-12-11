import fs from 'fs'
import path from 'path'
import * as uuid from 'uuid'
import {Grid, GridCoordinate, surroundingCoordinates, valueAtCoordinate} from '../../utils/Grid'
import * as S from '../../utils/Set'

const TRAIL_START = 0
const TRAIL_END = 9

type CoordinateString = `trailhead:${number},${number}::end:${number},${number}` // two 'x,y' pairs

// the raw text from https://adventofcode.com/2024/day/10/input
const grid: Grid<number> = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n').map(line => line.split('').map(Number))

const trailheads: Set<GridCoordinate> = new Set()
grid.forEach((row, y) => {
  row.forEach((value, x) => {
    if (value === TRAIL_START) trailheads.add({x, y})
  })
})

const findNextStepsOfTrail = (coordinate: GridCoordinate): GridCoordinate[] => {
  const currentValue = valueAtCoordinate(grid, coordinate)!
  return surroundingCoordinates(grid, coordinate, false, c => valueAtCoordinate(grid, c) === currentValue + 1)
}

const solveForNthStepOfTrail = (part: '1' | '2', trailhead: GridCoordinate, coordinate: GridCoordinate): Set<string> => {
  const valAtCoordinate = valueAtCoordinate(grid, coordinate)
  if (valAtCoordinate === TRAIL_END) {
    // part 1: we only want to track unique trail start&ending pairs, so we use a Set to prune duplicates
    // part 2: we want to track every unique path to an ending, so circumvent uniqueness with UUIDs instead of using a different data structure
    if (part === '1') {
      const val: CoordinateString = `trailhead:${trailhead.x},${trailhead.y}::end:${coordinate.x},${coordinate.y}`
      return new Set([val])
    } else {
      return new Set([uuid.v4()])
    }
  }

  const nextSteps = findNextStepsOfTrail(coordinate)
  if (nextSteps.length === 0) {
    return new Set()
  }

  return S.union(...nextSteps.map(nextStep => solveForNthStepOfTrail(part, trailhead, nextStep)))
}

console.log('part 1:', S.union(...S.values(trailheads).map(th => solveForNthStepOfTrail('1', th, th))).size)
console.log('part 2:', S.union(...S.values(trailheads).map(th => solveForNthStepOfTrail('2', th, th))).size)

/*

...0...
...1...
...2...
6543456
7.....7
8.....8
9.....9

*/
