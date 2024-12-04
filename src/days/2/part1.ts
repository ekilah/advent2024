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

const determineDirectionThrows = (a: number, b: number): Exclude<TDirection, 'neither'> => {
  const d = determineDirection(a, b)
  if (d === 'neither') {
    throw d
  }
  return d
}

// A report only counts as safe if both of the following are true:
//
// The levels are either all increasing or all decreasing.
// Any two adjacent levels differ by at least one and at most three.
const isReportSafe = (report: number[]): boolean => {
  try {
    // edge cases, a direction can't be determined
    if (report.length < 2) {
      return false
    }

    const expectedDirection = determineDirectionThrows(report[0]!, report[1]!)

    let failed = false

    for (
      let idx = 0;
      idx < report.length - 1 && !failed; // the last element will be checked in the N-1th loop
      idx++
    ) {
      const a = report[idx]!
      const b = report[idx+1]!
      if (determineDirectionThrows(a, b) !== expectedDirection) {
        failed = true
      } else if (Math.abs(a - b) > 3) {
        failed = true
      }
    }
    return !failed
  } catch {
    return false
  }
}

const safeReports = reports.reduce((acc, report) => acc + +isReportSafe(report), 0)
console.log(`safe reports: ${safeReports} / ${reports.length}`)
