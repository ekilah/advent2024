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
) => {
  for(let y = 0; y < grid.length; y++) {
    const row = grid[y]!
    console.log(row.join(''))
  }
  console.log('')
}
