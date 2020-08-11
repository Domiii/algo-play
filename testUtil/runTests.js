require('../util/prettyLogs');

const colors = require('colors/safe');
const isEqual = require('lodash/isEqual');
const pick = require('lodash/pick');
const cloneDeep = require('lodash/cloneDeep');
const partition = require('lodash/partition');
const { LocalStorage } = require("node-localstorage");
// global.
const localStorage = new LocalStorage('./_tmp');

const TestResultStatus = {
  None: 0,
  Error: 1,
  Fail: 2,
  Sucess: 3
};

function log(colorName, ...args) {
  const col = colors[colorName];
  console.log(...args.map(arg => col(arg)));
}

function getPreviousResult(previousTestData, [input, expectedOutput]) {
  return previousTestData.find(prev => isEqual(prev.input, input));
}

function getPreviousTestStatus(previousTestData, testData) {
  const result = getPreviousResult(previousTestData, testData);
  return result && result.status || TestResultStatus.None;
}

function filterTestData(name, testData, nMaxFailedTests) {
  nMaxFailedTests = parseInt(nMaxFailedTests) || 0;

  if (!nMaxFailedTests) {
    // no filtering wanted
    return null;
  }

  const previousTestResults = JSON.parse(localStorage.getItem(name));
  if (!previousTestResults || !previousTestResults.length) {
    // no previous run
    return null;
  }

  const [include] = testData.reduce(([acc, nFailed], t) => {
    const previousStatus = getPreviousTestStatus(previousTestResults, t);
    const hasFailed = !!previousStatus && previousStatus !== TestResultStatus.Sucess;
    const hasRun = !previousStatus;
    const shouldRun = 
      hasRun ||
      (hasFailed && nFailed < nMaxFailedTests);
    acc.push(shouldRun);
    return [acc, nFailed+hasFailed];
  }, [[], 0]);

  // return testData split into two: tests to include 
  // let [testsToRun, excludedTests] = partition(Array.from(testData.keys()), (i) => include[i]);
  const testsToRun = testData.filter((t, i) => include[i]);
  const excludedTests = testData.filter((t, i) => !include[i]);

  const oldTestResults = previousTestResults.filter(({ input }) => excludedTests.some(t => isEqual(input, t[0])));

  return {
    testsToRun,
    oldTestResults
  }
}

/**
 * @param {(input) => {}} algo 
 * @param {any[]} testData 
 * @param {number} failedOnly If not set, run all tests. If given, determines the amount of failed tests to re-run. -1 to run all failed tests.
 */
module.exports = function runTests(algo, allTestData, nMaxFailedTests = 0) {
  const name = algo.name;

  try {
    console.log();

    let testData = allTestData;
    let oldTestResults;
    try {
      const filterResult = filterTestData(name, allTestData, nMaxFailedTests);
      if (!filterResult || !filterResult.testsToRun.length) {
        // no filtering
        console.warn(`There were no failed tests last time. Running all tests.`);
      }
      else {
        ({
          oldTestResults,
          testsToRun: testData
        } = filterResult);
      }
    }
    catch (err) {
      console.error(`Failed to filter test data. Running all tests. - `, err);
    }

    console.log('Running', testData.length, 'of', allTestData.length, `tests for ${name}:`);

    const newResults = [];
    for (let i = 0; i < testData.length; ++i) {
      const [input, expectedOutput] = testData[i];

      let actualOutput, isCorrect, error;
      try {
        // NOTE: algo might change input, so we want to keep the original
        const copiedInput = cloneDeep(input);
        actualOutput = algo(copiedInput);
        isCorrect = isEqual(actualOutput, expectedOutput);
      }
      catch (err) {
        error = err;

      }

      // compute status
      let status, statusMessage, color;
      if (error) {
        status = TestResultStatus.Error;
        statusMessage = colors.red('ERR');
        color = 'white';
      }
      else if (!isCorrect) {
        status = TestResultStatus.Fail;
        statusMessage = colors.red('x');
        color = 'white';
      }
      else {
        status = TestResultStatus.Sucess;
        statusMessage = colors.green('✓');
        color = 'gray';
      }

      newResults.push({
        i,
        input,
        status,
        color,
        statusMessage,
        expectedOutput,
        actualOutput
      });

      // testTable.push({
      //   Status: statusMessage,
      //   'Input': JSON.stringify(input),
      //   'Expected': JSON.stringify(JSON.stringify(expectedOutput)),
      //   'Actual': JSON.stringify(JSON.stringify(output))
      // });

      // setTimeout(() => {}, 500);
    }

    // sort by status
    newResults.sort((a, b) => a.status - b.status);

    // print all results
    for (const result of newResults) {
      const {
        i,
        input,
        status,
        color,
        statusMessage,
        expectedOutput,
        actualOutput
      } = result;

      // report!
      log(color);
      log(color, `Test #${i + 1}: ${statusMessage}`);
      log(color, `  Input:    ${JSON.stringify(input)}`);
      log(color, `  Expected: ${JSON.stringify(expectedOutput)}`);
      log(color, `  Actual:   ${JSON.stringify(actualOutput)}`);
    }

    const savedResult = [
      ...newResults,
      ...oldTestResults || []
    ];

    localStorage.setItem(name, JSON.stringify(savedResult, null, 2));

    console.log();
    // console.table(testTable);
  }
  catch (err) {
    console.error('[INTERNAL ERROR] Oh-oh! omething went wrong while testing -', err.stack);


    // clear cache
    localStorage.setItem(name, 'null');
  }
}