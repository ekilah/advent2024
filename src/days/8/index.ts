import fs from 'fs'
import path from 'path'
import {max} from 'ramda'
import * as R from 'ramda'
import {
  CoordinateString,
  forEachGridCoordinate,
  Grid,
  gridBounds,
  GridCoordinate,
  isValidCoordinate,
  toCoordinateString,
} from '../../utils/Grid'
import * as M from '../../utils/Map'

// the raw text from https://adventofcode.com/2024/day/8/input
const grid: Grid<string> = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n').filter(R.identity).map(row => row.split(''))
const {maxX, maxY} = gridBounds(grid)

// printGrid(grid)
const gridWithAntinodes = structuredClone(grid) // for pretty printing

// for every antenna type, collect the coordinates
const antennas: Map<string, GridCoordinate[]> = new Map()
forEachGridCoordinate(grid, (value, coordinate) => {
  if (value === '.') return
  const arr = antennas.get(value) ?? []
  antennas.set(value, [...arr, coordinate])
})

// for every pair of antennae of the same key,
// find the slope and extend it past each antenna
// to find the anitnodes

const calculateAntinodes = (part: '1' | '2') => {
  const antinodes: Set<CoordinateString> = new Set() // 'x,y'

  M.forEachIndexed((coordinatesList, _antennaType) => {
    const pairs: [GridCoordinate, GridCoordinate][] = []

    for (let i = 0; i < coordinatesList.length - 1; i++) {
      for (let j = i + 1; j < coordinatesList.length; j++) {
        pairs.push([coordinatesList[i]!, coordinatesList[j]!])
      }
    }

    pairs.forEach(([pointA, pointB]) => {
      const xDelta = pointA.x - pointB.x
      const yDelta = pointA.y - pointB.y

      // part 1: a single point past each antenna in a pair.
      // part 2: any valid point along the slope of each pair of antennae
      let pointsOnSlope: GridCoordinate[] = part === '1'
        ? [
            {x: pointA.x + xDelta, y: pointA.y + yDelta},
            {x: pointB.x - xDelta, y: pointB.y - yDelta},
          ]
        : R.times(R.identity, 2 * max(maxX + 1, maxY + 1)).map(n => ([
          {x: pointB.x - (n * xDelta), y: pointB.y - n*(yDelta)},
          {x: pointA.x + (n * xDelta), y: pointA.y + n*(yDelta)},
        ])).flat(1)

      pointsOnSlope.filter(R.curry(isValidCoordinate)(grid)).forEach(anti => {
        antinodes.add(toCoordinateString(anti))
        if (gridWithAntinodes[anti.y]![anti.x]! === '.') gridWithAntinodes[anti.y]![anti.x]! = '#'
      })
    })
  }, antennas)

  return antinodes
}

const part1 = calculateAntinodes('1')
console.log('part 1:', part1.size)

const part2 = calculateAntinodes('2')
console.log('part 2:', part2.size)
// printGrid(gridWithAntinodes)
