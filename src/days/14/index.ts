import fs from 'fs'
import path from 'path'
import * as R from 'ramda'
import {compact} from 'utils'
import {GridCoordinate, mQuadrantForCoordinate} from '../../utils/Grid'
import * as M from '../../utils/Map'

// the raw text from https://adventofcode.com/2024/day/14/input
const inputRows: string[] = compact(fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n'))

type RobotConfig = {
  startingPosition: GridCoordinate
  velocity: {dx: number; dy: number}
}

const getCSVPair = (s: string): [number, number] => {
  const matches = s.match(/(-?\d+),(-?\d+)/)!
  const tuple: [string, string] = [matches[1]!, matches[2]!]
  return tuple.map(Number)
}

const robotConfigs: RobotConfig[] = inputRows.map(r => {
  const [p, v] = (r.split(' ') as [string, string]).map(getCSVPair)

  return {
    startingPosition: {x: p[0], y: p[1]},
    velocity: {dx: v[0], dy: v[1]},
  }
})

const sample = false
const width = sample ? 11 : 101
const height = sample ? 7 : 103

const steps = 100

const addThisIfNegative = (addThis: number, maybeNegative: number) => {
  return maybeNegative < 0 ? addThis + maybeNegative : maybeNegative
}

const endingPositions: GridCoordinate[] = robotConfigs.map(rc => {
  const {startingPosition: {x, y}, velocity: {dx, dy}} = rc

  return {
    x: addThisIfNegative(width, (dx * steps + x) % width),
    y: addThisIfNegative(height, (dy * steps + y) % height),
  }
})

const quadrantPopulations = (positions: GridCoordinate[]): number[] => {
  const quadrants = M.groupBy(R.identity, positions.map(c => mQuadrantForCoordinate({width, height}, c)).filter(mQuad => mQuad !== undefined))
  return M.values(quadrants).map(list => list.length)
}

console.log('part 1:', R.reduce(R.multiply, 1, quadrantPopulations(endingPositions)))
