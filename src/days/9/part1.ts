import fs from 'fs'
import path from 'path'
import * as R from 'ramda'

// the raw text from https://adventofcode.com/2024/day/9/input
const diskMap = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')[0]!

// diskMap
// 2333133121414131402
//
// uncompressedIdMap
// 00...111...2...333.44.5555.6666.777.888899
//
// building compressedIdMap
// 00...111...2...333.44.5555.6666.777.888899
// 009..111...2...333.44.5555.6666.777.88889.
// 0099.111...2...333.44.5555.6666.777.8888..
// 00998111...2...333.44.5555.6666.777.888...
// 009981118..2...333.44.5555.6666.777.88....
// 0099811188.2...333.44.5555.6666.777.8.....
// 009981118882...333.44.5555.6666.777.......
// 0099811188827..333.44.5555.6666.77........
// 00998111888277.333.44.5555.6666.7.........
// 009981118882777333.44.5555.6666...........
// 009981118882777333644.5555.666............
// 00998111888277733364465555.66.............
// 0099811188827773336446555566..............

const FREE = '.'

const uncompressedIdMap = (() => {
  let uncompressed: string[] = []
  let fileId = 0

  diskMap.split('').forEach((entry, idx) => {
    const freeSpace = idx % 2 === 1
    const repeatCount = Number(entry)

    uncompressed.push(...R.repeat(freeSpace ? FREE : `${fileId++}`, repeatCount))
  })
  return {uncompressed}
})

const {uncompressed} = uncompressedIdMap()

const justNumbersArr = uncompressed.filter(c => c !== FREE)
const uncompressedShorter = uncompressed.slice(0, justNumbersArr.length)

const compressedArr = uncompressedShorter.map(c => c === FREE ? justNumbersArr.pop()! : c)

const checksum = compressedArr.reduce((acc, currentChar, idx) => acc + Number(currentChar) * idx, 0)

console.log(checksum)
