const runTests = require('./testUtil/runTests');

/**
 * @see https://app.codesignal.com/arcade/intro/level-2/xskq4ZxLyqQMCLshr
 */
function matrixElementsSum(m) {
  let sum = m.reduce((rowAcc, row, r) =>
    rowAcc + row.reduce((cellAcc, cell, c) => {
      if (r > 0 && m[r-1][c] === 0) {
        m[r][c] = 0;
      }
      return cellAcc + m[r][c];
    }, 0)
  , 0);
  return sum;
}

runTests(matrixElementsSum, [
  [
    [[0, 1, 1, 2],
    [0, 5, 0, 0],
    [2, 0, 3, 3]],
    9
  ],
  [
    [[1, 1, 1, 0],
    [0, 5, 0, 1],
    [2, 1, 3, 10]],
    9
  ],
  [
    [[1, 1, 1],
    [2, 2, 2],
    [3, 3, 3]],
    18
  ]
],
1);