import fs from 'fs'
import path from 'path'
import * as M from '../../utils/Map'

type Grid = string[][]
type GridCoordinate = {x: number, y: number}

const printGrid = (
  grid: Grid,
) => {
  for(let y = 0; y < grid.length; y++) {
    const row = grid[y]!
    console.log(row.join(''))
  }
  console.log('')
}

// the raw text from https://adventofcode.com/2024/day/8/input
const grid: Grid = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n').map(row => row.split(''))

const maxX = grid[0]!.length - 1
const maxY = grid.length - 1
const isValidCoordinate = ({x, y}: GridCoordinate) => {
  return x >= 0 && y >= 0 && x <= maxX && y <= maxY
}

printGrid(grid)
const gridWithAntinodes = structuredClone(grid)

// for every antenna type, collect the coordinates
const antennas: Map<string, GridCoordinate[]> = new Map()
grid.forEach((row, y) => {
  row.forEach((value, x) => {
    if (value === '.') return
    const arr = antennas.get(value) ?? []
    antennas.set(value, [...arr, {x, y}])
  })
})

// for every pair of antennae of the same key,
// find the slope and extend it past each antenna
// to find the anitnodes

const calculateAntinodes = () => {
  const antinodes: Set<`${number},${number}`> = new Set() // 'x,y'

  M.forEachIndexed((coordinatesList, _antennaType) => {
    const pairs: [GridCoordinate, GridCoordinate][] = []

    for (let i = 0; i < coordinatesList.length - 1; i++) {
      for (let j = i + 1; j < coordinatesList.length; j++) {
        pairs.push([coordinatesList[i]!, coordinatesList[j]!])
      }
    }

    pairs.forEach(([a, b]) => {
      const xDelta = a.x - b.x
      const yDelta = a.y - b.y;

      ([
        {x: a.x + xDelta, y: a.y + yDelta},
        {x: b.x - xDelta, y: b.y - yDelta},
      ]).filter(isValidCoordinate).forEach(anti => {
        antinodes.add(`${anti.x},${anti.y}`)
        if (gridWithAntinodes[anti.y]![anti.x]! === '.') gridWithAntinodes[anti.y]![anti.x]! = '#'
      })
    })
  }, antennas)

  return antinodes
}



console.log(calculateAntinodes().size)
// printGrid(gridWithAntinodes)