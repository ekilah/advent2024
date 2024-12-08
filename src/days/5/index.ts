import * as fs from 'fs'
import * as R from 'ramda'
import path from 'path'
import * as M from '../../utils/Map'
import * as S from '../../utils/Set'

// utils
const EMPTY_SET = new Set()

const middleNumber = <T>(list: T[]) => list[Math.trunc(list.length / 2)]!

const largestSetFirst = (a: Set<number>, b: Set<number>) => b.size - a.size

const parseInputFileIntoDataStructures = (): {allPageNumberLists: number[][]; valuesCantComeBeforeKeys: Map<number, Set<number>>} => {
  // the raw text from https://adventofcode.com/2024/day/5/input
  const [allRulesAsOneString, pageNumberListsAsOneString] = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n\n') as [string, string]

  const valuesCantComeBeforeKeys = new Map<number, Set<number>>()

  allRulesAsOneString.split('\n').forEach(line => {
    const [key, value] = line.split('\|').map(str => Number(str)) as [number, number]
    const existingValueSet = valuesCantComeBeforeKeys.get(key) ?? new Set()
    valuesCantComeBeforeKeys.set(key, S.add(value, existingValueSet))
  })

  const allPageNumberLists = pageNumberListsAsOneString.split('\n').map(pageNumberListStr => {
    return pageNumberListStr.split(',').map(x => Number(x))
  })

  return {allPageNumberLists, valuesCantComeBeforeKeys}
}

// part 1
//
// the rules tell us what numbers can't come before a given number
// `47|53` says 53 can't come before 47.
//
// strategy: collect all the numbers that can't come before a given number into a Map of Sets
//
// then, for a given X in a page number list, check for an intersection between the
// set of numbers before it and the numbers that cant come before it

const getBrokenListsAndMiddleNumberSum = (
  pageNumberLists: number[][],
  ruleMap: Map<number, Set<number>>
): {brokenLists: number[][]; middleNumberSum: number} => {
  let sumOfMiddlePageNumbers = 0
  const foundBrokenLists: number[][] = []

  pageNumberLists.forEach(pageNumberList => {
    const setOfNumbersBeforeCurrentIndex = new Set<number>([pageNumberList[0]!])
    let failed = false
    for(let pageIdx = 1; pageIdx < pageNumberList.length && !failed; pageIdx++) {
      const pageNum = pageNumberList[pageIdx]!

      if (S.intersects(setOfNumbersBeforeCurrentIndex, ruleMap.get(pageNum) ?? EMPTY_SET)) {
        failed = true
        foundBrokenLists.push(pageNumberList)
        break
      }

      setOfNumbersBeforeCurrentIndex.add(pageNum)
    }

    if (!failed) {
      sumOfMiddlePageNumbers += middleNumber(pageNumberList)
    }
  })

  return {brokenLists: foundBrokenLists, middleNumberSum: sumOfMiddlePageNumbers}
}

const {allPageNumberLists, valuesCantComeBeforeKeys} = parseInputFileIntoDataStructures()
const part1Results = getBrokenListsAndMiddleNumberSum(allPageNumberLists, valuesCantComeBeforeKeys)
console.log('part1:', part1Results.middleNumberSum)

// part 2:
//
// fix the broken lists from part1, and then sum up (only) those now-fixed lists' middle numbers
//
// strategy:
// the rule sets are guaranteed to be valid, and they seem to all be "complete" (such that there is only one solution for each list)
// so, filter down the rules to only those that mention (on either side of the `|`) the numbers in a given broken list
// and sort them, pickiest number first. that sorted order will be a/the valid list

const part2MiddleNumbers = part1Results.brokenLists.map((brokenList) => {
  // filter for rules whose LHS is in the broken list
  const rulesFilteredByKeys = M.keep(brokenList, valuesCantComeBeforeKeys)

  // filter for rules whose LHS is in the broken list
  const rulesFilteredByKeysAndValues = M.map((fullSet => S.intersection(fullSet, new Set(brokenList))), rulesFilteredByKeys)

  // sort remaining rules, pickiest (longest rule set) key first. the ordered keys are the non-broken list.
  const sortedRulesMostStrictFirst = M.sort([largestSetFirst], rulesFilteredByKeysAndValues)

  // can prove the list isn't broken by checking it here, for fun
  const {middleNumberSum: middleNumber, brokenLists} = getBrokenListsAndMiddleNumberSum([M.keys(sortedRulesMostStrictFirst)], sortedRulesMostStrictFirst)
  if (brokenLists.length > 0) throw new Error('part 2 still has a broken list!')

  return middleNumber
})

console.log('part 2:', R.sum(part2MiddleNumbers))
