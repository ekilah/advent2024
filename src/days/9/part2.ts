import fs from 'fs'
import path from 'path'
import * as R from 'ramda'

// the raw text from https://adventofcode.com/2024/day/9/input
const diskMap = fs.readFileSync(path.join(__dirname, './adventOfCodeInput.txt'), 'utf8').split('\n')[0]!

// only move whole files this time, and only try moving a file once, only to its left.
//
// diskMap
// 2333133121414131402
//
// uncompressedIdMap
// 00...111...2...333.44.5555.6666.777.888899
//
// final
// 00992111777.44.333....5555.6666.....8888..

const FREE = '.'

const uncompressedIdMap = (() => {
  let uncompressed: string[][] = []
  let fileId = 0
  const sizeofEachFreeBlock: number[] = []

  diskMap.split('').forEach((entry, idx) => {
    const freeSpace = idx % 2 === 1
    const repeatCount = Number(entry)

    if (freeSpace) sizeofEachFreeBlock.push(repeatCount)
    uncompressed.push(R.repeat(freeSpace ? FREE : `${fileId++}`, repeatCount))
  })
  return {uncompressed, sizeofEachFreeBlock}
})

// while figuring out the uncompressed mapping of file IDs,
// track the size of each free space block for later reference.
const {uncompressed, sizeofEachFreeBlock} = uncompressedIdMap()

const compressed = structuredClone(uncompressed)

for(let fileToTryMovingIdx = compressed.length - 1; fileToTryMovingIdx > 0; fileToTryMovingIdx -= 2) {
  const fileToTryMoving = compressed[fileToTryMovingIdx]!
  const freeBlockListIdx = sizeofEachFreeBlock.findIndex(free => free >= fileToTryMoving.length)
  const mDestinationIdx = freeBlockListIdx * 2 + 1

  // careful not to move a file unless the destination is earlier than where it is already
  if (mDestinationIdx >= 1 && mDestinationIdx < fileToTryMovingIdx) {
    // clear the old spot
    compressed[fileToTryMovingIdx] = R.repeat(FREE, fileToTryMoving.length)

    // put the moved file into the new spot, leaving the leftover free slots for later use by a smaller file
    const startReplacingAt = compressed[mDestinationIdx]!.findIndex(c => c === FREE)
    for (let i = 0; i < fileToTryMoving.length; i++) {
      compressed[mDestinationIdx]![i + startReplacingAt]! = fileToTryMoving[i]!
    }

    // remember how much space is left here
    sizeofEachFreeBlock[freeBlockListIdx] = Math.max(0, sizeofEachFreeBlock[freeBlockListIdx]! - fileToTryMoving.length)
  }
}

const checksum = compressed.flat(1).reduce((acc, currentChar, idx) =>
  acc + (currentChar === FREE ? 0 : Number(currentChar)) * idx,
  0
)

console.log('part 2:', checksum)
