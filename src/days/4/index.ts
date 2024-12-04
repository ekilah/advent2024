import * as fs from 'fs'
import path from 'path'
import {compact} from 'utils'

// the raw text from https://adventofcode.com/2024/day/4/input
// split into each row, and removing empty lines/the EOF
const inputRows = compact(fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n'))
const maxValidCoordinatesInPuzzle = {x: inputRows[0]!.length - 1, y: inputRows.length - 1}

// for each X, queue up the coordinates that we'd have to look for the M, A, and S
// and once we have a list of coordinates, go find which ones all line up to spell XMAS

type TCoordinate = {x: number, y: number}
type TDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
type TCoordinateWithDirection = TCoordinate & {direction: TDirection}

const allDirections = new Set([ 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'])

const letterAtCoordinate = ({x, y}: TCoordinate) => inputRows[y]![x]!

// for XMAS, possible locations for an M would be found via n=1, A via n=2
const nthLetterCoordinatesFromStartOfWord = (n: number, startOfWord: TCoordinate, onlyTheseDirections = allDirections): TCoordinateWithDirection[] => {
  const {x, y} = startOfWord
  return [
    {x, y: y - n, direction: 'n' as const},
    {x, y: y + n, direction: 's' as const},

    {y, x: x + n, direction: 'e' as const},
    {y, x: x - n, direction: 'w' as const},

    {x: x - n, y: y - n, direction: 'nw' as const},
    {x: x + n, y: y + n, direction: 'se' as const},

    {x: x - n, y: y + n, direction: 'sw' as const},
    {x: x + n, y: y - n, direction: 'ne' as const},
  ].filter(c => onlyTheseDirections.has(c.direction) && c.x >= 0 && c.y >= 0 && c.x <= maxValidCoordinatesInPuzzle.x && c.y <= maxValidCoordinatesInPuzzle.y)
}

const possibleMsForX = (startOfXMAS: TCoordinate) => nthLetterCoordinatesFromStartOfWord(1, startOfXMAS)
const possibleAsForX = (startOfXMAS: TCoordinate, onlyTheseDirections: Set<TDirection>) => nthLetterCoordinatesFromStartOfWord(2, startOfXMAS, onlyTheseDirections)
const possibleSsForX = (startOfXMAS: TCoordinate, onlyTheseDirections: Set<TDirection>) => nthLetterCoordinatesFromStartOfWord(3, startOfXMAS, onlyTheseDirections)

const part1 = () => {
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

