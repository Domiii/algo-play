const runTests = require('../testUtil/runTests');
const linkedList = require('../testUtil/linkedList');
const { isEqual } = require('lodash');


/**
 * @see https://app.codesignal.com/interview-practice/task/gX7NXPBrYThXZuanm/
 */
function removeKFromList(l, k) {
  let p = null, current = l;
  while (current) {
    if (current.value === k) {
      if (!p) {
        l = current = current.next;
      }
      else {
        p.next = current = current.next;
      }
    } 
    else {
      p = current;
      current = current.next;
    }
  }
  return l;
}

runTests(removeKFromList,
  [
    [
      [linkedList([3, 1, 2, 3, 4, 5]), 3],
      linkedList([1, 2, 4, 5])
    ],
    [
      [linkedList([1, 2, 3, 4, 5, 6, 7]), 10],
      linkedList([1, 2, 3, 4, 5, 6, 7])
    ],
    [
      [linkedList([1000, 1000]), 1000],
      linkedList([])
    ],
    [
      [linkedList([1, 2, 2, 4]), 2],
      linkedList([1, 4])
    ]
  ],
  1
);

module.exports = removeKFromList;