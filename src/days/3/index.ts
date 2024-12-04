import * as fs from 'fs'
import path from 'path'
import * as R from 'ramda'

// the raw text from https://adventofcode.com/2024/day/3/input
const input = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8')

const runMulStatementsAndSumThemInText = (text: string) => {
  const matches = [...text.matchAll(/mul\((\d{1,3}),(\d{1,3})\)/g)]
  const pairs = matches.map(match => [Number(match[1]), Number(match[2])])

  return R.sum(pairs.map(pair => pair[0]! * pair[1]!))
}

const part1 = () => {
  console.log('part 1:', runMulStatementsAndSumThemInText(input))
}

part1()

const part2 = () => {
  // find every section starting with `do()`
  // this excludes the actual `do()` text itself, and includes the first bit of
  // the input that is implicitly `do()`'d.
  const splitOnDoInstructions = input.split(/do\(\)/)
  const removeEverythingAfterDont = splitOnDoInstructions.map(text => text.replace(/don't\(\)[\s\S]*/, ''))
  const combinedIntoOneString = removeEverythingAfterDont.join('')

  // same as part1 now
  console.log('part 2:', runMulStatementsAndSumThemInText(combinedIntoOneString))
}

part2()
