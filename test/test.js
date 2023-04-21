const C = require('./constants');

const adminTests = require('./tests/adminTests');
const happyPath = require('./tests/happyPath');
const { createTest, createErrorTests } = require('./tests/createTests');
const redeemTest = require('./tests/redeemTests');
const { relockTest, relockErrorTest } = require('./tests/relockTests');
const { locknLoadTests, locknLoadErrorTests } = require('./tests/locknLoadTests');
const { loadTests, loadErrorTests } = require('./tests/loadTests');

const paramsMatrix = [
  { amount: C.E18_100, unlockShift: 100, relockShift: 10, load: C.E18_100 },
  { amount: C.E18_1000, unlockShift: 1800, relockShift: 500, load: C.E18_100 },
  { amount: C.E18_05, unlockShift: 1200, relockShift: 15000, load: C.E18_100 },
  { amount: C.E18_13, unlockShift: 1500, relockShift: 7250, load: C.E18_100 },
];

// describe('it tests the deploy and admin functions', () => {
//   adminTests();
// });

// describe('It goes through the happy path to deploy, create a TimeLockedBank NFT, relock and then redeem', () => {
//   paramsMatrix.forEach((param) => {
//     happyPath(param);
//   });
// });

// describe('The creating tests and create error tests', () => {
//   paramsMatrix.forEach((param) => {
//     createTest(param);
//   });
//   createErrorTests();
// });

// describe('Testing for redemption methods', () => {
//   paramsMatrix.forEach((param) => {
//     redeemTest(param);
//   });
// });

describe('Testing for the relock methods and errors', () => {
  paramsMatrix.forEach((param) => {
    relockTest(param);
  });
  relockErrorTest();
});

describe('Testing for the load method and errors', () => {
  paramsMatrix.forEach((param) => {
    loadTests(param);
  });
  loadErrorTests();
});


describe('Testing for the Lock and Load method and errors', () => {
  paramsMatrix.forEach((param) => {
    locknLoadTests(param);
  });
  locknLoadErrorTests();
});