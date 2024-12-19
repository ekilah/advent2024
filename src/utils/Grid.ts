import * as R from 'ramda'
import {isInteger} from 'ramda-adjunct'

export type Grid<T> = T[][]
export type GridCoordinate = {x: number, y: number}

export const gridBounds = (grid: Grid<unknown>) => {
  const maxX = grid[0]!.length - 1
  const maxY = grid.length - 1

  return {maxX, maxY}
}

export const isValidCoordinate = (grid: Grid<unknown>, {x, y}: GridCoordinate): boolean => {
  const {maxX, maxY} = gridBounds(grid)
  return x >= 0 && y >= 0 && isInteger(x) && isInteger(y) && x <= maxX && y <= maxY
}

export const valueAtCoordinate = <T>(grid: Grid<T>, {x, y}: GridCoordinate): T | undefined =>
  grid[y]?.[x]

export const setValueAtCoordinate = <T>(grid: Grid<T>, {x, y}: GridCoordinate, value: T): void => {
  grid[y]![x] = value
}

export const surroundingCoordinates = <T>(
  grid: Grid<T>,
  {x, y}: GridCoordinate,
  includeDiagonals: boolean,
  filter: (coordinate: GridCoordinate) => boolean = () => true
): GridCoordinate[] => {
  const diagonals = [
    {x: x-1, y: y-1}, {x: x-1, y: y+1},
    {x: x+1, y: y-1}, {x: x+1, y: y+1},
  ]
  const straights = [
                 {x: x-1, y},
    {x, y: y-1},              {x, y: y+1},
                 {x: x+1, y},
  ]

  const neighbors = includeDiagonals ? [...diagonals, ...straights] : straights
  return neighbors.filter(c => {
    const isValid = isValidCoordinate(grid, c)
    const custom = filter(c)
    return isValid && custom
  })
}

export const printGrid = <T>(
  grid: Grid<T>,
  overrideCharacter?: (c: GridCoordinate, v: T) => T,
) => {
  for(let y = 0; y < grid.length; y++) {
    const row = grid[y]!.map((v, x) => overrideCharacter?.({x, y}, v) ?? v)
    console.log(row.join(''))
  }
  console.log('')
}

export const forEachGridCoordinate = <T>(
  grid: Grid<T>,
  callback: (value: T, coordinate: GridCoordinate) => void
): void => {
  grid.forEach((row, y) => {
    row.forEach((value, x) => {
      callback(value, {x, y})
    })
  })
}

export type CoordinateString = `${number},${number}` // 'x,y'

export const toCoordinateString = (coordinate: GridCoordinate): CoordinateString =>
  `${coordinate.x},${coordinate.y}`

export const fromCoordinateString = (coordinateString: CoordinateString): GridCoordinate => {
  const [x, y] = coordinateString.split(',') as [string, string]
  return {x: Number(x), y: Number(y)}
}

// returns `undefined` if the coordinate is on one of the axes in the middle of the grid (for odd-axis'd grids)
// (which some puzzles say to do, oddly.)
// 0 is top left, 1 is top right, 2 is bottom right, 3 is bottom left (clockwise)
export const mQuadrantForCoordinate = (gridSize: {width: number; height: number}, coordinate: GridCoordinate): 0 | 1 | 2 | 3 | undefined => {
  // if these are integers, the axis size was odd, which means there's a "gap" to skip in the middle of the axis.
  // if they are N.5, then the axis size was even, which means there's no "gap" to skip.
  const midX = (gridSize.width - 1) / 2
  const midY = (gridSize.height - 1) / 2

  if (coordinate.x < midX && coordinate.y < midY) {
    return 0
  } else if (coordinate.x > midX && coordinate.y < midY) {
    return 1
  } else if (coordinate.x > midX && coordinate.y > midY) {
    return 2
  } else if (coordinate.x < midX && coordinate.y > midY) {
    return 3
  }
  return undefined
}

export const coordinatesToGrid = <T>(
  coordinates: GridCoordinate[],
  gridSize: {width: number; height: number},
  defaultGridSquareValue: T,
  buildValueForCoordinate: (
    coordinate: GridCoordinate,
    currentValueAtCoordinate: T,
    coordinateIndex: number
  ) => T,
): Grid<T> => {
  const grid: Grid<T> = []
  grid.push(...R.times<T[]>(() => R.repeat(defaultGridSquareValue, gridSize.width), gridSize.height))

  coordinates.forEach((c, idx) => {
    if (isValidCoordinate(grid, c)) {
      grid[c.y]![c.x] = buildValueForCoordinate(c, valueAtCoordinate(grid, c)!, idx)
    } else {
      throw new Error(`invalid coordinate ${c.x},${c.y}`)
    }
  })

  return grid
}

export const findInGrid = <T>(
  grid: Grid<T>,
  predicate: (value: T, coordinate: GridCoordinate) => boolean
): {value: T; coordinate: GridCoordinate} | undefined => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y]!.length; x++) {
      const value = grid[y]![x]!;
      const mFound = predicate(value, {x, y})
      if (mFound) {
        return {value, coordinate: {x, y}}
      }
    }
  }
  return undefined
}
