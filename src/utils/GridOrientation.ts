import {Grid, GridCoordinate, isValidCoordinate, valueAtCoordinate} from 'utils/Grid'

export const RIGHT = {x: 1,  y: 0,  id: 'Right', char: '>'} as const
export const DOWN  = {x: 0,  y: 1,  id: 'Down',  char: 'v'} as const
export const LEFT  = {x: -1, y: 0,  id: 'Left',  char: '<'} as const
export const UP    = {x: 0,  y: -1, id: 'Up',    char: '^'} as const

export type GridOrientation =
  | typeof RIGHT
  | typeof DOWN
  | typeof LEFT
  | typeof UP

export type GridOrientationChar = '>' | 'v' | '<' | '^'

export const arrowCharToOrientation = (
  char: GridOrientationChar
): GridOrientation => {
  switch (char) {
    case 'v':
      return DOWN
    case '<':
      return LEFT
    case '^':
      return UP
    case '>':
      return RIGHT
    default:
      throw new Error(`arrowCharToOrientation: illegal value: ${char}`)
  }
}

// the next coordinate if we were to move forward towards the given orientation
export const nextCoordinateTowardsOrientation = (position: GridCoordinate, orientation: GridOrientation): GridCoordinate =>
  ({...position, x: position.x + orientation.x, y: position.y + orientation.y})

export const valueInFrontOfCoordinate = <T>(grid: Grid<T>, position: GridCoordinate, orientation: GridOrientation) => {
  return valueAtCoordinate(grid, nextCoordinateTowardsOrientation(position, orientation))
}

// turning right between each
const orderedOrientations: GridOrientation[] = [RIGHT, DOWN, LEFT, UP]

export const rotateRight = (orientation: GridOrientation): GridOrientation => {
  const idx = orderedOrientations.indexOf(orientation)
  return orderedOrientations[(idx + 1) % orderedOrientations.length]!
}

// excludes `position`. in order from closest to `position` to furthest from it.
export const allCoordinatesTowardsOrientation = (
  grid: Grid<unknown>,
  position: GridCoordinate,
  orientation: GridOrientation
): GridCoordinate[] => {
  let tempPos = nextCoordinateTowardsOrientation(position, orientation)

  const result: GridCoordinate[] = []
  while (isValidCoordinate(grid, tempPos)) {
    result.push(tempPos)
    tempPos = nextCoordinateTowardsOrientation(tempPos, orientation)
  }

  return result
}

