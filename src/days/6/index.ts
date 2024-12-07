import * as R from 'ramda'
import fs from 'fs'
import path from 'path'

/*

....#.....
.........#
..........
..#.......
.......#..
..........
.#..^.....
........#.
#.........
......#...

 */

// the grid will store the number of visits as positive numbers
const OBSTACLE = -1
const BLANK = 0

type Grid = number[][]
type GridCoordinate = {x: number, y: number, __tag: 'coordinate'}
type Orientation = 
  | {x: 1,  y: 0,  id: 'Right'}
  | {x: 0,  y: 1,  id: 'Down'}
  | {x: -1, y: 0,  id: 'Left'}
  | {x: 0,  y: -1, id: 'Up'}

const RIGHT: Orientation = {x: 1,  y: 0,  id: 'Right'}
const DOWN: Orientation  = {x: 0,  y: 1,  id: 'Down'}
const LEFT: Orientation  = {x: -1, y: 0,  id: 'Left'}
const UP: Orientation    = {x: 0,  y: -1, id: 'Up'}

// turning right between each
const orderedOrientations: Orientation[] = [RIGHT, DOWN, LEFT, UP]

// turn right
const rotateOrientation = (orientation: Orientation): Orientation => {
  const idx = orderedOrientations.indexOf(orientation)
  return orderedOrientations[(idx + 1) % orderedOrientations.length]!
}

const valueAtCoordinate = (grid: Grid, {x, y}: GridCoordinate) =>
  grid[y]?.[x]

const incrementValueAtCoordinate = (grid: Grid, position: GridCoordinate) => {
  const {x, y} = position
  grid[y]![x]! = valueAtCoordinate(grid, position)! + 1
}

// the next coordinate if we were to move forward towards the given orientation
const nextCoordinate =  (position: GridCoordinate, orientation: Orientation): GridCoordinate =>
  ({...position, x: position.x + orientation.x, y: position.y + orientation.y})

const whatIsInFrontOfMe = (grid: Grid, position: GridCoordinate, orientation: Orientation) => {
  return valueAtCoordinate(grid, nextCoordinate(position, orientation))
}

// mutates grid if we move
// returns a new position or orientation, or undefined if we left the board
const moveOrRotate = (
  grid: Grid, currentPosition: GridCoordinate, currentOrientation: Orientation
): undefined | {newPosition: GridCoordinate; newOrientation: Orientation} => {
  const inFrontOfMe = whatIsInFrontOfMe(grid, currentPosition, currentOrientation)

  if (inFrontOfMe === OBSTACLE) {
    return {newOrientation: rotateOrientation(currentOrientation), newPosition: currentPosition}
  } else if (inFrontOfMe === undefined) {
    // off the grid
    return undefined
  } else {
    // open space
    const newPosition= nextCoordinate(currentPosition, currentOrientation)
    incrementValueAtCoordinate(grid, newPosition)
    return {newPosition, newOrientation: currentOrientation}
  }
}

const moveUntilOffGrid = (
  grid: Grid,
  currentPosition: GridCoordinate,
  currentOrientation: Orientation
) => {
  let mNewPosAndOrientation = moveOrRotate(grid, currentPosition, currentOrientation)
  while (mNewPosAndOrientation) {
    mNewPosAndOrientation = moveOrRotate(grid, mNewPosAndOrientation.newPosition, mNewPosAndOrientation.newOrientation)
  }

  // the guard has left
  // count the number of > 0 squares
  const flatGrid = R.flatten(grid)
  return flatGrid.filter(n => n > BLANK).length
}

// the raw text from https://adventofcode.com/2024/day/5/input
const rowsOfGrid = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')

let startingPosition: GridCoordinate | undefined
let startingOrientation: Orientation | undefined

// parse the input into our `Grid` data structure, and capture the starting pos/orientation
const grid: Grid = rowsOfGrid.map((row, y) =>
  row.split('').map((square, x) => {
    if (square === '#') return OBSTACLE
    if (square === '.') return BLANK

    startingPosition = {x, y, __tag: 'coordinate'}
    startingOrientation = ((): Orientation | undefined => {
      switch (square) {
        case 'v':
          return DOWN
        case '<':
          return LEFT
        case '^':
          return UP
        case '>':
          return RIGHT
        default:
          return undefined
      }
    })()
    return 1 // count the starting position as visited!
  })
)

if (!startingPosition || !startingOrientation) {
  console.error('parsing error', startingPosition, startingOrientation)
} else {
  console.log('part 1:', moveUntilOffGrid(grid, startingPosition, startingOrientation))
}
