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

const PART1_BOX = 'O' as const

const ROBOT = '@' as const
const WALL = '#' as const
const BOX_LEFT = '[' as const
const BOX_RIGHT = ']' as const
const BLANK = '.' as const

type GridCharType =
  | typeof ROBOT
  | typeof WALL
  | BoxSideType
  | typeof BLANK

type BoxSideType = typeof BOX_LEFT | typeof BOX_RIGHT

const oppositeBox = (char: BoxSideType) =>
  char === BOX_LEFT ? BOX_RIGHT : BOX_LEFT

const pairedCoordinateForHalfBoxAt = (coordinate: GridCoordinate, halfBox: BoxSideType) =>
  halfBox === '[' ? {...coordinate, x: coordinate.x + 1} : {...coordinate, x: coordinate.x - 1}

const doubleCharsForPart2 = (char: string): string => {
  switch (char) {
    case WALL: return `${WALL}${WALL}`
    case PART1_BOX: return `${BOX_LEFT}${BOX_RIGHT}`
    case BLANK: return `${BLANK}${BLANK}`
    case ROBOT: return `${ROBOT}${BLANK}`
    case '\n': return char
    default: throw new Error(`illegal char in doubleCharsForPart2: ${char}`)
  }
}

// the raw text from https://adventofcode.com/2024/day/14/input
const input = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8')

const [part1GridInput, directionInputWithNewlines] = input.split('\n\n') as [string, string]

// grid
const part2GridInput = part1GridInput.split('').map(doubleCharsForPart2).join('')
const grid = part2GridInput
  .split('\n')
  .map(l => l.split('')) as Grid<GridCharType>

// directions
const directionChars = directionInputWithNewlines.replace(/\s/g, '').split('') as GridOrientationChar[]
const orientations = directionChars.map((char, idx) => {
  return arrowCharToOrientation(char)
})

// robot
const {coordinate: startingRobotPosition} = findInGrid(grid, v => v === ROBOT)!

/*
##############
##......##..##
##..........##
##...[][]...##
##....[]....##
##.....@....##
##############
*/

// console.log('Initial grid')
// printGrid(grid)

// part 2
let currentRobotPosition: GridCoordinate = {...startingRobotPosition}
orientations.forEach((orientation, orientationIdx) => {
  const inFrontOfMeCoordinate = nextCoordinateTowardsOrientation(currentRobotPosition, orientation)
  const inFrontOfMe = valueInFrontOfCoordinate(grid, currentRobotPosition, orientation)!

  switch (inFrontOfMe) {
    case BLANK:
      // just move
      setValueAtCoordinate(grid, currentRobotPosition, BLANK)
      currentRobotPosition = inFrontOfMeCoordinate
      setValueAtCoordinate(grid, currentRobotPosition, ROBOT)
      break
    case WALL:
      // do nothing
      break
    case BOX_LEFT:
    case BOX_RIGHT: {
      const everythingInFront = allCoordinatesTowardsOrientation(grid, currentRobotPosition, orientation)

      // horizontal is simple enough, nothing much changed here from part1 besides the complexity of moving multi-sided boxes
      if (orientation.char === '<' || orientation.char === '>') {
        let stoppedBecauseWeFoundWallOrBlank: boolean = false
        let stoppedAtCoordinate: GridCoordinate | undefined = undefined

        for(let inFrontIdx = 2; inFrontIdx < everythingInFront.length && !stoppedBecauseWeFoundWallOrBlank; inFrontIdx++) {
          const inFrontCoord = everythingInFront[inFrontIdx]!
          const inFrontVal = valueAtCoordinate(grid, inFrontCoord)

          switch (inFrontVal) {
            case BLANK:
              stoppedAtCoordinate = inFrontCoord

                // shift everythingInFront over one. they are all boxes.
                // this means flipping all but the last one's (which is a blank) box side
                everythingInFront.slice(0, inFrontIdx).forEach(c => setValueAtCoordinate(grid, c, oppositeBox(valueAtCoordinate(grid, c) as BoxSideType)))
                // the last one becomes the opposite of the first one
                setValueAtCoordinate(grid, stoppedAtCoordinate, oppositeBox(inFrontOfMe))

                setValueAtCoordinate(grid, currentRobotPosition, BLANK)

                currentRobotPosition = inFrontOfMeCoordinate
                setValueAtCoordinate(grid, currentRobotPosition, ROBOT)

                stoppedBecauseWeFoundWallOrBlank = true

              break

            case WALL:
              // there's no space to move things.
              stoppedBecauseWeFoundWallOrBlank = true
              break
            case BOX_LEFT:
            case BOX_RIGHT:
              // keep iterating, we can move multiple boxes.
              break

            default:
              throw new Error(`illegal inFrontVal: ${inFrontVal}`)
          }
        }
      } else {
        // moving vertically.
        const initialBoxCoordinates = [inFrontOfMeCoordinate, pairedCoordinateForHalfBoxAt(inFrontOfMeCoordinate, inFrontOfMe)]

        const boxCoordinatesToVerifyMovable: GridCoordinate[] = [...initialBoxCoordinates]
        const changesAtCoordinatesIfAllowed = [
          ...initialBoxCoordinates.map((c: GridCoordinate): [GridCoordinate, BoxSideType | typeof BLANK] => [c, BLANK]),
        ]
        let hitAWall = false

        for(let boxCoordWeAreVerifyingIdx = 0; boxCoordWeAreVerifyingIdx < boxCoordinatesToVerifyMovable.length && !hitAWall; boxCoordWeAreVerifyingIdx++) {
          const verifyingCoordinate = boxCoordinatesToVerifyMovable[boxCoordWeAreVerifyingIdx]!
          const verifyingValue = valueAtCoordinate(grid, verifyingCoordinate) as BoxSideType
          const valueInFrontOfMe = valueInFrontOfCoordinate(grid, verifyingCoordinate, orientation)

          // no matter what, we want our character to be moved, and we want to clear the spot behind us
          // unshift so that our BLANK is overwritten by any already-iterated-over, earlier boxes moving into our spot
          changesAtCoordinatesIfAllowed.unshift(
            [nextCoordinateTowardsOrientation(verifyingCoordinate, orientation), verifyingValue],
            [verifyingCoordinate, BLANK]
          )

          if (valueInFrontOfMe === verifyingValue) {
            // same side of the box as us, so just check its front next
            boxCoordinatesToVerifyMovable.push(nextCoordinateTowardsOrientation(verifyingCoordinate, orientation))
          } else if (valueInFrontOfMe === oppositeBox(verifyingValue)) {
            // opposite side of the box, so check both sides of it next
            boxCoordinatesToVerifyMovable.push(
              nextCoordinateTowardsOrientation(verifyingCoordinate, orientation),
              nextCoordinateTowardsOrientation(pairedCoordinateForHalfBoxAt(verifyingCoordinate, valueInFrontOfMe), orientation),
            )
          } else if (valueInFrontOfMe === BLANK) {
            // do nothing, this side of this box can move freely
          } else if (valueInFrontOfMe === WALL) {
            hitAWall = true
          }
        }

        if (!hitAWall) {
          // apply all the changes we queued up
          changesAtCoordinatesIfAllowed.forEach(([changeCoordinate, toValue]) => {
            setValueAtCoordinate(grid, changeCoordinate, toValue)
          })

          // then fix the robot's old and new positions, same as part1
          setValueAtCoordinate(grid, currentRobotPosition, BLANK)
          currentRobotPosition = inFrontOfMeCoordinate
          setValueAtCoordinate(grid, currentRobotPosition, ROBOT)
        }
      }

      break
    }
    default:
      throw new Error(`illegal inFrontOfMe: ${inFrontOfMe}`)
  }

  // console.log(`${orientationIdx}) Move ${orientation.char}:`)
  // printGrid(grid)
})

let part1BoxGPSSum = 0
forEachGridCoordinate(grid, (value, {x, y}) => {
  if (value === BOX_LEFT) {
    part1BoxGPSSum += (100*y + x)
  }
})

console.log('part 2:', part1BoxGPSSum)
