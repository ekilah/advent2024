import * as R from 'ramda'
import fs from 'fs'
import path from 'path'
import {Grid, GridCoordinate, valueAtCoordinate} from '../../utils/Grid'
import {
  GridOrientation,
  RIGHT,
  DOWN,
  LEFT,
  UP,
  arrowCharToOrientation,
  GridOrientationChar, nextCoordinateTowardsOrientation, rotateRight
} from '../../utils/GridOrientation'

/*

example input:

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


// the grid will store visited squares as positive numbers, where the number stored
// is a binary number that tracks what direction(s) the visit(s) happened in
const OBSTACLE = -1
const BLANK = 0
const VISITED_RIGHT = 0b0001
const VISITED_DOWN =  0b0010
const VISITED_LEFT =  0b0100
const VISITED_UP =    0b1000

const characterForGridSquare = (
  value: number,
  {x, y}: {x: number, y: number},
  showCursorAt?: {pos: GridCoordinate, orient: GridOrientation}
) => {
  if (showCursorAt && x === showCursorAt?.pos.x &&  y === showCursorAt?.pos.y) {
    return showCursorAt.orient.char
  }
  if (value < 0) return '#'
  if (value === 0) return '.'

  const HORIZONTAL = VISITED_RIGHT | VISITED_LEFT
  const VERTICAL = VISITED_UP | VISITED_DOWN

  if (value & HORIZONTAL && value & VERTICAL) return '+'
  else if (value & HORIZONTAL) return '-'
  else if (value & VERTICAL) return '|'

  return '?'
}

const printGrid = (
  grid: Grid<number>,
  showCursor?: {pos: GridCoordinate, orient: GridOrientation},
  obstacleAt?: GridCoordinate,
) => {
  for(let y = 0; y < grid.length; y++) {
    const row = grid[y]!
    console.log(row.map((val, x) => {
      if (R.equals(obstacleAt, {x, y})) return 'O'
      return characterForGridSquare(val, {x, y}, showCursor)
    }).join(''))
  }
  console.log('')
}

const orientationToBool = (orientation: GridOrientation) => {
  switch (orientation) {
    case RIGHT:
      return VISITED_RIGHT
    case DOWN:
      return VISITED_DOWN
    case LEFT:
      return VISITED_LEFT
    case UP:
      return VISITED_UP
    default:
      return BLANK
  }
}

const markCoordinateAsVisitedInOrientation = (grid: Grid<number>, position: GridCoordinate, orientation: GridOrientation) => {
  const {x, y} = position
  grid[y]![x]! = valueAtCoordinate(grid, position)! | orientationToBool(orientation)
}

class LoopDetectedError {}

// mutates grid if we move
// returns a new position or orientation, or undefined if we left the board
const moveOrRotate = (
  grid: Grid<number>,
  currentPosition: GridCoordinate,
  currentOrientation: GridOrientation,
  alreadyPlacedAnObstacle: boolean
): undefined | {newPosition: GridCoordinate; newOrientation: GridOrientation, obstacleInFrontWouldHaveProducedALoop: boolean} => {
  const positionInFrontOfMe = nextCoordinateTowardsOrientation(currentPosition, currentOrientation)
  const valueInFrontOfMe = valueAtCoordinate(grid, positionInFrontOfMe)

  if (valueInFrontOfMe === OBSTACLE) {
    // rotate, but first mark ourselves as turning at the current position
    const newOrientation = rotateRight(currentOrientation)
    markCoordinateAsVisitedInOrientation(grid, currentPosition, newOrientation)
    return {
      newPosition: currentPosition,
      newOrientation,
      obstacleInFrontWouldHaveProducedALoop: false,
    }
  } else if (valueInFrontOfMe === undefined) {
    // off the grid
    return undefined
  } else {
    // open space

    if ((valueInFrontOfMe & orientationToBool(currentOrientation)) > BLANK) {
      // loops shouldn't happen on the part1 input, but this is useful for part2
      throw new LoopDetectedError()
    }

    // was any space to my right already visited in the direction I'd be travelling in if I turned now?
    const obstacleInFrontWouldHaveProducedALoop = (() => {
      if (valueInFrontOfMe > BLANK) {
        // can't place an obstacle where I've already walked
        return false
      }

      // we only place a single obstacle at a time during part2 checks
      if (alreadyPlacedAnObstacle) {
        return false
      }

      // dupe the grid, make a new obstacle, see if a loop happens
      const tempGrid = structuredClone(grid)
      tempGrid[positionInFrontOfMe.y]![positionInFrontOfMe.x]! = OBSTACLE
      try {
        moveUntilOffGrid(tempGrid, currentPosition, currentOrientation, true)
        return false
      } catch (e) {
        if (e instanceof LoopDetectedError) {
          return true
        }
        throw e
      }
    })()

    // if (obstacleInFrontWouldHaveProducedALoop) {
    //   console.log('obstacleInFrontWouldHaveProducedALoop')
    //   printGrid(grid, {pos: currentPosition, orient: currentOrientation}, nextCoordinateTowardsOrientation(currentPosition, currentOrientation))
    // }

    const newPosition= nextCoordinateTowardsOrientation(currentPosition, currentOrientation)
    markCoordinateAsVisitedInOrientation(grid, newPosition, currentOrientation)
    return {
      newPosition,
      newOrientation: currentOrientation,
      obstacleInFrontWouldHaveProducedALoop,
    }
  }
}

const moveUntilOffGrid = (
  grid: Grid<number>,
  currentPosition: GridCoordinate,
  currentOrientation: GridOrientation,
  alreadyPlacedAnObstacle: boolean
): {
  numberOfStepsTaken: number
  timesAnObstacleOnABlankWouldHaveProducedALoop: number
} => {
  let timesAnObstacleOnABlankWouldHaveProducedALoop = 0

  let mNewPosAndOrientation = moveOrRotate(grid, currentPosition, currentOrientation, alreadyPlacedAnObstacle)
  while (mNewPosAndOrientation) {
    timesAnObstacleOnABlankWouldHaveProducedALoop += mNewPosAndOrientation.obstacleInFrontWouldHaveProducedALoop ? 1 : 0
    mNewPosAndOrientation = moveOrRotate(grid, mNewPosAndOrientation.newPosition, mNewPosAndOrientation.newOrientation, alreadyPlacedAnObstacle)
  }

  // the guard has left
  // count the number of > 0 squares
  const flatGrid = R.flatten(grid)
  const numberOfStepsTaken = flatGrid.filter(n => n > BLANK).length

  return {numberOfStepsTaken, timesAnObstacleOnABlankWouldHaveProducedALoop}
}

// the raw text from https://adventofcode.com/2024/day/5/input
const rowsOfGrid = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')

let startingPosition: GridCoordinate | undefined
let startingOrientation: GridOrientation | undefined

// parse the input into our `Grid` data structure, and capture the starting pos/orientation
const grid: Grid<number> = rowsOfGrid.map((row, y) =>
  row.split('').map((square, x) => {
    if (square === '#') return OBSTACLE
    if (square === '.') return BLANK

    startingPosition = {x, y}
    startingOrientation = arrowCharToOrientation(square as GridOrientationChar)
    return orientationToBool(startingOrientation) // count the starting position as visited!
  })
)

if (!startingPosition || !startingOrientation) {
  throw new Error('parsing error')
}

console.log('starting grid:')
printGrid(grid, {pos: startingPosition, orient: startingOrientation})

const solution = moveUntilOffGrid(grid, startingPosition, startingOrientation, false)
console.log('part 1:', solution.numberOfStepsTaken)
console.log('')
console.log('part 2:', solution.timesAnObstacleOnABlankWouldHaveProducedALoop)
console.log('')

printGrid(grid)


/*
  part 2 strategy/retro:

  on every step forward, recurse after placing a new/temp obstacle in front
  of you, checking if you ever get into a loop.
  you can detect if you're in a loop if the cursor would travel in the same
  direction that you've already traveled on a given square.

  my first naive pass was to just check if any squares to the right of the
  cursor were already travelled in the same direction.
  that missed the fact that obstacles could be hit when checking for a loop.

  then, I realized that you can't even just turn when that happens and keep
  checking for initially-travelled squares, because an obstacle can create
  a loop that was entirely new space never touched by the original path.
  for example:

  ..#...        O.#...        O.#...
  .....#        |....#        +-+-+#
  .#....   ->   |#....   ->   |#+-+.
  ....#.        |...#.        |...#.
  ^.....        |.....        |.....

*/
