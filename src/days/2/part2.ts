import {omitIndexes} from 'ramda-adjunct'
import {compact, findIndices} from '~/utils'

/*
export const reports = [
  [1, 2, 3, 5, 4],
  ...
]
*/
import {reports} from './adventOfCodeInput'

type TDirection = 'increasing' | 'decreasing' | 'neither'

const determineDirection = (a: number, b: number): TDirection =>
  a === b
    ? 'neither'
    : a < b
      ? 'increasing'
      : 'decreasing'

// A report only counts as safe if both of the following are true:
//
// The levels are either all increasing or all decreasing.
// Any two adjacent levels differ by at least one and at most three.
//
// one violation is ok this time
const isReportSafeish = (report: number[], alreadyRecursing: boolean): boolean => {
  // edge cases, a direction can't be determined
  if (report.length < 2) {
    return false
  }

  const trends: (TDirection | 'tooLarge')[] = []

  for (let idx = 0; idx < report.length - 1; idx++) {
    const a = report[idx]!
    const b = report[idx+1]!

    if (Math.abs(a - b) > 3) {
      trends.push('tooLarge')
    } else {
      trends.push(determineDirection(a, b))
    }
  }

  const tooLargeIndices = findIndices(t => t === 'tooLarge', trends)
  const increasingIndices = findIndices(t => t === 'increasing', trends)
  const decreasingIndices = findIndices(t => t === 'decreasing', trends)
  const neitherIndices = findIndices(t => t === 'neither', trends)

  const numberOfInvalidConditions = compact([
    tooLargeIndices.length > 0,
    neitherIndices.length > 0,
    (increasingIndices.length > 0 && decreasingIndices.length > 0), // a direction change
  ]).length

  if (numberOfInvalidConditions > 1) {
    // multiple issues. for the most part, we can't fix more than one issue, except:

    if (!alreadyRecursing && tooLargeIndices.length === 1 && (increasingIndices.length === 1 || decreasingIndices.length === 1)) {
      // a tooLarge may have caused the direction change. try removing either of the tooLarge pairs to see if that helps
      // these cases require this fix, they should be valid but fail without this.
      //  [29, 26, 24, 25, 21,],
      //  [68, 65, 69, 72, 74, 77, 80, 83,],
      //  [75, 77, 72, 70, 69,],
      return isReportSafeish(omitIndexes([tooLargeIndices[0]!], report), true) ||
        isReportSafeish(omitIndexes([tooLargeIndices[0]! + 1], report), true)
    }

    return false
  } else if (numberOfInvalidConditions === 0) {
    return true // no issues to resolve
  } else if (alreadyRecursing && numberOfInvalidConditions === 1) {
    return false
  }

  // exactly one of the invalid conditions is occurring.

  if (tooLargeIndices.length > 1) {
    return false // can't save this report, even if we remove one tooLarge, the other will still be too large
  } else if (tooLargeIndices.length === 1) {
    // try removing the one too-large number to see if that helps
    // (useful if the too-large number also went in the wrong direction)
    // the too-large-of-a-diff number is the right member of the evaluated pair, hence the `+1`
    console.log('one too large, recursing to check it', {report})
    return isReportSafeish(omitIndexes([tooLargeIndices[0]!], report), true) ||
      isReportSafeish(omitIndexes([tooLargeIndices[0]! + 1], report), true)
  }

  if (neitherIndices.length > 1) {
    return false // can't save this report, even if we remove one repeated number, there will still be another
  } else if (neitherIndices.length === 1) {
    return true // a single repeated number is always solvable by removing it, if that was the only problem
  }

  // if we get here, then there was a direction change.
  // (increasingIndices.length > 0 && decreasingIndices.length > 0)
  // if there is more than one, we can't do anything about it
  if (increasingIndices.length > 1 && decreasingIndices.length > 1) {
    return false
  }

  // if there was only one, try removing the number causing it.
  if (
    (increasingIndices.length === 1 && increasingIndices[0] === 0) ||
    (decreasingIndices.length === 1 && decreasingIndices[0] === 0)
  ){
    // the problem occurs at the start of the report. e.g. the first pair decreases and the rest increase
    // remove the first number
    return isReportSafeish(omitIndexes([0], report), true)
  } else if (
    (increasingIndices.length === 1 && increasingIndices[0] === report.length - 1) ||
    (decreasingIndices.length === 1 && decreasingIndices[0] === report.length - 1)
  ){
    // the problem occurs at the end of the report. e.g. the last pair decreases and the rest increase
    // remove the last number
    return isReportSafeish(omitIndexes([report.length - 1], report), true)
  } else {
    // the problem is in the middle of the report, e.g. the second pair decreases and the rest increase
    //  [3, 4, 1, 5, 7]  - removing `1` would be good (problematicPairIndex 1, report index 2)
    //  [3, 6, 4, 5, 7]  - removing`6` would be good (problematicPairIndex 1, report index 1)
    // try removing each of them
    const problematicPairIndex = increasingIndices.length === 1 ? increasingIndices[0]! : decreasingIndices[0]!

    return isReportSafeish(omitIndexes([problematicPairIndex], report), true) ||
      isReportSafeish(omitIndexes([problematicPairIndex + 1], report), true)
  }
}

// should all pass as safeish
// https://www.reddit.com/r/adventofcode/comments/1h4shdu/2024_day_2_part2_edge_case_finder/
const commonEdgeCases = [
  [48, 46, 47, 49, 51, 54, 56,],
  [1, 1, 2, 3, 4, 5,],
  [1, 2, 3, 4, 5, 5,],
  [5, 1, 2, 3, 4, 5,],
  [1, 4, 3, 2, 1,],
  [1, 6, 7, 8, 9,],
  [1, 2, 3, 4, 3,],
  [9, 8, 7, 6, 7,],
  [7, 10, 8, 10, 11,],
  [29, 28, 27, 25, 26, 25, 22, 20,],
  [90, 89, 86, 84, 83, 79,],
  [97, 96, 93, 91, 85,],
  [29, 26, 24, 25, 21,],
  [36, 37, 40, 43, 47,],
  [43, 44, 47, 48, 49, 54,],
  [35, 33, 31, 29, 27, 25, 22, 18,],
  [77, 76, 73, 70, 64,],
  [68, 65, 69, 72, 74, 77, 80, 83,],
  [37, 40, 42, 43, 44, 47, 51,],
  [70, 73, 76, 79, 86,],
  [31, 34, 32, 30, 28, 27, 24, 22,],
  [75, 77, 72, 70, 69,],
]

const reportsToCheck = true ? reports : commonEdgeCases

const safeReports = reportsToCheck.reduce((acc, report) => acc + +isReportSafeish(report, false), 0)
console.log(`safe-ish reports: ${safeReports} / ${reportsToCheck.length}`)
