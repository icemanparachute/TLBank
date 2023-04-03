const C = require('./constants');

const adminTests = require('./tests/adminTests');
const happyPath = require('./tests/happyPath');
const { createTest, createErrorTests } = require('./tests/createTests');
const redeemTest = require('./tests/redeemTests');
const {relockTest, relockErrorTest} = require('./tests/relockTests');

describe('it tests the deploy and admin functions', () => {
  adminTests();
});

describe('It goes through the happy path to deploy, create a TimeLockedBank NFT, relock and then redeem', () => {
  const paramsMatrix = [{ amount: C.E18_100, unlockShift: 100 }];
  paramsMatrix.forEach((param) => {
    happyPath(param);
  });
});

describe('The creating tests and create error tests', () => {
    const paramsMatrix = [
        {amount: C.E18_1000, unlockShift: 100}
    ];
    paramsMatrix.forEach((param) => {
        createTest(param);
    });
    createErrorTests();
});

describe('Testing for redemption methods', () => {
    const paramsMatrix = [
        {amount: C.E18_1000, unlockShift: 100}
    ];
    paramsMatrix.forEach((param) => {
        redeemTest(param);
    });
});

describe('Testing for the relock methods and errors', () => {
    const paramsMatrix = [
        {amount: C.E18_1000, unlockShift: 100}
    ];
    paramsMatrix.forEach((param) => {
        relockTest(param);
    });
    relockErrorTest();
});
