import * as fs from 'fs'
import path from 'path'
import {intersects} from 'utils/Set'
import * as S from 'utils/Set'

const EMPTY_SET = new Set()

// the rules tell us what numbers can't come before a given number
// `47|53` says 53 can't come before 47.

// collect all the numbers that can't come before X

// then, for a given X in a page number list, check for an intersection between the
// set of numbers before it and the numbers that cant come before it
const part1 = () => {

// the raw text from https://adventofcode.com/2024/day/5/input
  const [rules, pageNumberLists] = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n\n') as [string, string]

  const valuesCantComeBeforeKey = new Map<number, Set<number>>()

  rules.split('\n').forEach(line => {
    const [key, value] = line.split('\|').map(str => Number(str)) as [number, number]
    const existingValueSet = valuesCantComeBeforeKey.get(key) ?? new Set()
    valuesCantComeBeforeKey.set(key, S.add(value, existingValueSet))
  })

  let sumOfMiddlePageNumbers = 0
  pageNumberLists.split('\n').forEach(pageNumberListStr => {
    const pageNumberList = pageNumberListStr.split(',').map(x => Number(x))

    const setOfNumbersBeforeCurrentIndex = new Set<number>([pageNumberList[0]!])
    let failed = false
    for(let pageIdx = 1; pageIdx < pageNumberList.length && !failed; pageIdx++) {
      const pageNum = pageNumberList[pageIdx]!

      if (intersects(setOfNumbersBeforeCurrentIndex, valuesCantComeBeforeKey.get(pageNum) ?? EMPTY_SET)) {
        failed = true
        break
      }

      setOfNumbersBeforeCurrentIndex.add(pageNum)
    }

    if (!failed) {
      sumOfMiddlePageNumbers += pageNumberList[Math.trunc(pageNumberList.length / 2)]!
    }
  })

  console.log('part 1:', sumOfMiddlePageNumbers)
}

part1()
