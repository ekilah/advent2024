import fs from 'fs'
import path from 'path'
import {
  allCoordinatesTowardsOrientation,
  arrowCharToOrientation,
  GridOrientationChar, nextCoordinateTowardsOrientation,
  valueInFrontOfCoordinate
} from 'utils/GridOrientation'
import {
  findInGrid, forEachGridCoordinate,
  Grid,
  GridCoordinate,
  setValueAtCoordinate,
  valueAtCoordinate
} from '../../utils/Grid'

const ROBOT = '@' as const
const WALL = '#' as const
const BOX = 'O' as const
const BLANK = '.' as const

type GridCharType =
  | typeof ROBOT
  | typeof WALL
  | typeof BOX
  | typeof BLANK

// the raw text from https://adventofcode.com/2024/day/14/input
const input = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8')

// grid
const [gridInput, directionInputWithNewlines] = input.split('\n\n') as [string, string]
const grid = gridInput.split('\n').map(l => l.split('')) as Grid<GridCharType>
// directions
const directionChars = directionInputWithNewlines.replace(/\s/g, '').split('') as GridOrientationChar[]
const orientations = directionChars.map((char, idx) => {
  return arrowCharToOrientation(char)
})
// robot
const {coordinate: startingRobotPosition} = findInGrid(grid, v => v === ROBOT)!

// part 1
let currentRobotPosition: GridCoordinate = {...startingRobotPosition}
orientations.forEach((orientation, orientationIdx) => {
  const inFrontOfMe = valueInFrontOfCoordinate(grid, currentRobotPosition, orientation)!

  switch (inFrontOfMe) {
    case BLANK:
      // just move
      setValueAtCoordinate(grid, currentRobotPosition, BLANK)
      currentRobotPosition = nextCoordinateTowardsOrientation(currentRobotPosition, orientation)
      setValueAtCoordinate(grid, currentRobotPosition, ROBOT)
      break
    case WALL:
      // do nothing
      break
    case BOX: {
      const everythingInFront = allCoordinatesTowardsOrientation(grid, currentRobotPosition, orientation)

      // loop until we find a blank or a wall.
      // if a blank, we can shift all the boxes
      // if a wall, we can't move anything
      let stoppedBecauseWeFoundWallOrBlank: boolean = false
      let stoppedAtCoordinate: GridCoordinate | undefined = undefined
      for(let inFrontIdx = 1; inFrontIdx < everythingInFront.length && !stoppedBecauseWeFoundWallOrBlank; inFrontIdx++) {
        const inFrontCoord = everythingInFront[inFrontIdx]!
        const inFrontVal = valueAtCoordinate(grid, inFrontCoord)

        switch (inFrontVal) {
          case BLANK:
            stoppedAtCoordinate = inFrontCoord

            setValueAtCoordinate(grid, stoppedAtCoordinate, BOX)
            setValueAtCoordinate(grid, currentRobotPosition, BLANK)

            currentRobotPosition = nextCoordinateTowardsOrientation(currentRobotPosition, orientation)
            setValueAtCoordinate(grid, currentRobotPosition, ROBOT)

            stoppedBecauseWeFoundWallOrBlank = true
            break

          case WALL:
            // there's no space to move things.
            stoppedBecauseWeFoundWallOrBlank = true
            break
          case BOX:
            // keep iterating, we can move multiple boxes.
            break

          default:
            throw new Error(`illegal inFrontVal: ${inFrontVal}`)
        }
      }
      break
    }
    default:
      throw new Error(`illegal inFrontOfMe: ${inFrontOfMe}`)
  }
})

let part1BoxGPSSum = 0
forEachGridCoordinate(grid, (value, {x, y}) => {
  if (value === BOX) {
    part1BoxGPSSum += (100*y + x)
  }
})

console.log('part1:', part1BoxGPSSum)
