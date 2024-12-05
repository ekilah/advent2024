import * as fs from 'fs'
import path from 'path'
import {compact} from 'utils'
import {difference} from 'utils/Set'

// the raw text from https://adventofcode.com/2024/day/4/input
// split into each row, and removing empty lines/the EOF
const inputRows = compact(fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n'))
const maxValidCoordinatesInPuzzle = {x: inputRows[0]!.length - 1, y: inputRows.length - 1}

// for each X, queue up the coordinates that we'd have to look for the M, A, and S
// and once we have a list of coordinates, go find which ones all line up to spell XMAS

type TCoordinate = {x: number, y: number}
type TDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
type TCoordinateWithDirection = TCoordinate & {direction: TDirection}

const allDirections = new Set<TDirection>(['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'])

const letterAtCoordinate = ({x, y}: TCoordinate) => inputRows[y]![x]!

// for XMAS, possible locations for an M would be found via n=1, A via n=2
const nthLetterCoordinatesFromStartOfWord = (
  n: number,
  startOfWord: TCoordinate,
  onlyTheseDirections = allDirections
): TCoordinateWithDirection[] => {
  const {x, y} = startOfWord
  const coords: TCoordinateWithDirection[] = [
    {x, y: y - n, direction: 'n'},
    {x, y: y + n, direction: 's'},
    {y, x: x + n, direction: 'e'},
    {y, x: x - n, direction: 'w'},
    {x: x - n, y: y - n, direction: 'nw'},
    {x: x + n, y: y + n, direction: 'se'},
    {x: x - n, y: y + n, direction: 'sw'},
    {x: x + n, y: y - n, direction: 'ne'},
  ]

  return coords.filter(c =>
    onlyTheseDirections.has(c.direction) &&
    c.x >= 0 &&
    c.y >= 0 &&
    c.x <= maxValidCoordinatesInPuzzle.x &&
    c.y <= maxValidCoordinatesInPuzzle.y
  )
}

const part1 = () => {
  const possibleMsForX = (startOfXMAS: TCoordinate) => nthLetterCoordinatesFromStartOfWord(1, startOfXMAS)
  const possibleAsForX = (startOfXMAS: TCoordinate, onlyTheseDirections: Set<TDirection>) => nthLetterCoordinatesFromStartOfWord(2, startOfXMAS, onlyTheseDirections)
  const possibleSsForX = (startOfXMAS: TCoordinate, onlyTheseDirections: Set<TDirection>) => nthLetterCoordinatesFromStartOfWord(3, startOfXMAS, onlyTheseDirections)

  let count = 0
  for (let y = 0; y <= maxValidCoordinatesInPuzzle.y; y++) {
    for (let x = 0; x <= maxValidCoordinatesInPuzzle.x; x++) {
      const coordinate: TCoordinate = {x, y}
      if (letterAtCoordinate(coordinate) === 'X') {
        const possibleMs = possibleMsForX(coordinate)
        const actualMs = possibleMs.filter(c => letterAtCoordinate(c) === 'M')
        const actualMDirections = new Set(actualMs.map(c => c.direction))

        const possibleAs = possibleAsForX(coordinate, actualMDirections)
        const actualAs = possibleAs.filter(c => letterAtCoordinate(c) === 'A')
        const actualADirections = new Set(actualAs.map(c => c.direction))

        const possibleSs = possibleSsForX(coordinate, actualADirections)
        const actualSs = possibleSs.filter(c => letterAtCoordinate(c) === 'S')

        count += actualSs.length
      }
    }
  }

  console.log('part 1:', count)
}

part1()

const allDiagonalDirections = new Set<TDirection>(['ne', 'nw', 'se', 'sw'])
const areDiagonalsOpposites = (a: TCoordinateWithDirection, b: TCoordinateWithDirection) =>
  a.direction[0] !== b.direction[0] && a.direction[1] !== b.direction[1]

// strategy: for every A (the center), determine if it has 2 MAS at its diagonals
const part2 = () => {
  let count = 0

  // don't bother looking for As on the edges
  for (let y = 1; y < maxValidCoordinatesInPuzzle.y; y++) {
    for (let x = 1; x < maxValidCoordinatesInPuzzle.x; x++) {
      const coordinate: TCoordinate = {x, y}
      if (letterAtCoordinate(coordinate) === 'A') {
        const possibleMs = nthLetterCoordinatesFromStartOfWord(1, coordinate, allDiagonalDirections)
        const actualMs = possibleMs.filter(c => letterAtCoordinate(c) === 'M')

        // must be exactly 2 Ms, not on the opposite diagonals (not MAM / SAS)
        // then, there must be 2 Ss at the remaining diagonals
        if (actualMs.length === 2 && !areDiagonalsOpposites(actualMs[0]!, actualMs[1]!)) {
          const directionsForS = difference(allDiagonalDirections, new Set<TDirection>([actualMs[0]!.direction, actualMs[1]!.direction]))

          const possibleSs = nthLetterCoordinatesFromStartOfWord(1, coordinate, directionsForS)
          const actualSs = possibleSs.filter(c => letterAtCoordinate(c) === 'S')

          if (actualSs.length === 2) {
            count++
          }
        }
      }
    }
  }

  console.log('part 2:', count)
}

part2()
