import * as R from 'ramda'
import {listToOccurrenceCountMap} from '~/utils'

// export const numberlist: [number, number][] = [ [1, 2], [3, 4], ... ]
import {numberlist} from './adventOfCodeInput'

// part 1
// take list of pairs, treat them as 2 lists
// then sort them and sum up the distance between each pair of same-indexed numbers

// rotates the list of 1000 2-member lists to 2 1000-member lists
const [list1, list2] = R.transpose(numberlist) as [number[], number[]]

// in-place sort
list1.sort()
list2.sort()

const findDistance = (a: number, b: number) => Math.abs(a - b)

const distanceList = R.zipWith(findDistance, list1, list2)
const totalDistance = R.sum(distanceList)

console.log('part 1:', totalDistance)

// part 2
// count occurrences of each number from list1 in list2
// multiply list1 number by its occurrence count in list2
// sum up those multiples

const part2Naive = () => {
  let list1Idx = 0
  let list2Idx = 0
  let count = 0
  let totalMultipliedSum = 0

  while (list1Idx < list1.length && list2Idx < list2.length) {
    const one = list1[list1Idx]!
    let two = list2[list2Idx]!

    while (one === two) {
      count++

      if (++list2Idx < list2.length) {
        two = list2[list2Idx]!
      } else {
        break
      }
    }
    totalMultipliedSum += count * one
    count = 0

    if (one < two) {
      ++list1Idx
    } else {
      ++list2Idx
    }
  }

  console.log('part 2, w/ naive approach:', totalMultipliedSum)
}

const part2Map = () => {
  const numberToCountInList2 = listToOccurrenceCountMap(list2)

  // assumes that list1 doesn't have repeats, or if it does, the challenge wants them counted
  // (update: it doesn't have repeats)
  const totalMultipliedSum = list1.reduce((acc, one) =>
    acc + (one * (numberToCountInList2.get(one) ?? 0)),
    0
  )
  console.log('part 2, w/ map approach:', totalMultipliedSum)
}

part2Naive()
part2Map()
