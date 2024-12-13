import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import {
  CoordinateString,
  forEachGridCoordinate,
  fromCoordinateString,
  Grid,
  GridCoordinate,
  surroundingCoordinates,
  toCoordinateString,
  valueAtCoordinate
} from '../../utils/Grid'
import * as S from '../../utils/Set'

// the raw text from https://adventofcode.com/2024/day/12/input
const grid: Grid<string> = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n').map(line => line.split(''))
const valAt = (coordinate: GridCoordinate) => valueAtCoordinate(grid, coordinate)

const alreadyVisitedCoordinates = new Set<CoordinateString>()

const blankPerimeterAndArea = {perimeter: 0, area: 0}

// recursively find all my same-valued neighbors, tracking their perimeter values along the way.
const goPart1 = (
  coordinate: GridCoordinate
): {perimeter: number, area: number} => {
  const value = valueAtCoordinate(grid, coordinate)
  const neighbors = surroundingCoordinates(grid, coordinate, false, c => {
    return value === valueAtCoordinate(grid, c)
  })

  const myPerimeter = Math.max(0, 4 - neighbors.length)

  const recurse = neighbors.map(n => {
    if (!alreadyVisitedCoordinates.has(toCoordinateString(n))) {
      alreadyVisitedCoordinates.add(toCoordinateString(n))
      return goPart1(n)
    }
    return blankPerimeterAndArea
  })
  const recurseReduced = recurse.reduce((accs, x) => ({perimeter: accs.perimeter + x.perimeter, area: accs.area + x.area}), blankPerimeterAndArea)
  return {
    perimeter: myPerimeter + recurseReduced.perimeter,
    area: 1 + recurseReduced.area,
  }
}

let part1MapPrice = 0
const fieldsForPart2: Set<CoordinateString>[] = []

forEachGridCoordinate(grid, (value, coordinate) => {
  const allPriorFields = S.clone(alreadyVisitedCoordinates)

  const coordinateString = toCoordinateString(coordinate)
  if (alreadyVisitedCoordinates.has(coordinateString)) {
    return
  } else {
    alreadyVisitedCoordinates.add(coordinateString)
  }

  // this is one entire field's perimeter and area.
  const result = goPart1(coordinate)

  // goPart1 just added the new field's coordinates to alreadyVisitedCoordinates.
  // for part 2, I want to build fieldsForPart2 without rewriting that part of part 1. so I can just
  // take the prior value of alreadyVisitedCoordinates (allPriorFields) out of the current value
  // to get the new field we just scanned.
  const thisField = S.difference(alreadyVisitedCoordinates, allPriorFields)
  fieldsForPart2.push(thisField)

  // console.log('after visiting (', toCoordinateString(coordinate), ') with value', value, {result, thisField})
  part1MapPrice += (result.perimeter * result.area)
})

console.log('part 1:', part1MapPrice)

/*
  I had to look up some help for this part - couldn't think of how to count sides.
  From Reddit, got the hint that #/sides === #/corners, and here's one way to count corners:

  consider the top-left vertex: it's part of a corner if either:
    - Both the tile to the left and the tile to the top are different from 'X', or
    - Both the tile to the left and to the top are 'X', but the tile diagonally to the top-left is different from 'X'
*/
const howManyCornersAtCoordinate = ({x, y}: GridCoordinate) => {
  const value = valAt({x, y})

  const cornerGroups: [GridCoordinate, GridCoordinate][] = [
    [{x: x-1, y}, {x, y: y-1}], // top left
    [{x: x-1, y}, {x, y: y+1}], // bottom left
    [{x: x+1, y}, {x, y: y+1}], // bottom right
    [{x: x+1, y}, {x, y: y-1}], // top right
  ]

  let count = 0
  cornerGroups.forEach(([a, b]) => {
    const vA = valAt(a)
    const vB = valAt(b)
    const vC = valAt({x: a.x, y: b.y}) // the diagonal between a and b

    if (value !== vA && value !== vB) {
      count += 1
    } else if (value === vA && value === vB && vC && value !== vC) {
      count += 1
    }
  })

  return count
}

const part2MapPrice = R.sum(fieldsForPart2.map(field => {
  const fieldCorners = R.sum(S.values(field).map(coordStr =>
    howManyCornersAtCoordinate(fromCoordinateString(coordStr))
  ))
  return field.size * fieldCorners
}))

console.log('part 2:', part2MapPrice)
