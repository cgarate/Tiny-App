const { assert } = require("chai");

const {
  generateRandomString,
  getArrayIndexOfUrl,
  getEmailList,
  insertNewURL,
  insertNewURLForUser,
  insertUniqueVisitCount,
  insertVisitCount,
  insertVisitDetail,
  hasUserVisited,
  emailExists,
  validEmailPassword,
  getUserObject,
} = require("../utils");

const testAnalytics = {
  "4ttQiE": {
    visits: 3,
    uniquevisits: 1,
    details: [
      {
        timestamp: "Fri Apr 14 2017 15:30:24 GMT-0400 (EDT)",
        visitorID: "iYy4FTIhWe",
        visitorName: "User 1",
      },
      {
        timestamp: "Fri Apr 28 2018 15:30:24 GMT-0400 (EDT)",
        visitorID: "apEgcb6KSa",
        visitorName: "User 2",
      },
    ],
  },
};

const testDetail = {
  timestamp: "Sun Oct 13 2019 15:30:24 GMT-0400 (EDT)",
  visitorID: "cTy8aMlwZe",
  visitorName: "User 3",
};

const testUsers = {
  "iYy4FTIhWe": {
    id: "iYy4FTIhWe",
    name: "User 1",
    email: "user1@example.com",
    password: "$2b$10$u9jwjwAFHUpXdxv97kHYBOZnF2wf76esNLcU8VhmCgh19aw.tm5d.",
    shorturls: ["b2xVn2", "9sm5xK"],
  },
  "apEgcb6KSa": {
    id: "apEgcb6KSa",
    name: "User 2",
    email: "user2@example.com",
    password: "5678",
    shorturls: ["8e3tv1"],
  },
};

const testURLs = {
  "b2xVn2": "http://www.example.ca",
  "9sm5xK": "http://www.example.io",
  "c1tI2c": "http://www.example.com.mx",
  "8e3tv1": "http://www.example.com",
  "4ttQiE": "http://example.co.uk",
};

describe("utils.js", () => {
  it("should generate a 10 character long string of A", () => {
    assert.equal(generateRandomString(10, "A"), "AAAAAAAAAA");
  });

  it("insertUniqueVisitCount() - should add a unique visit", () => {
    const expected = {
      ...testAnalytics,
      ["4ttQiE"]: {
        ...testAnalytics["4ttQiE"],
        uniquevisits: testAnalytics["4ttQiE"].uniquevisits + 1,
      },
    };
    const result = insertUniqueVisitCount("4ttQiE", testAnalytics);
    assert.deepEqual(expected, result);
  });

  it("insertVisitCount() - should add a visit", () => {
    const expected = {
      ...testAnalytics,
      ["4ttQiE"]: {
        ...testAnalytics["4ttQiE"],
        visits: testAnalytics["4ttQiE"].visits + 1,
      },
    };
    const result = insertVisitCount("4ttQiE", testAnalytics);
    assert.deepEqual(expected, result);
  });

  it("insertVisitDetail() - should add visit detail", () => {
    const expected = {
      ...testAnalytics,
      ["4ttQiE"]: {
        ...testAnalytics["4ttQiE"],
        details: [...testAnalytics["4ttQiE"].details, testDetail],
      },
    };
    const result = insertVisitDetail("4ttQiE", testDetail, testAnalytics);
    assert.deepEqual(expected, result);
  });

  it("insertVisitDetail() - should add visit detail for a new URL", () => {
    const expected = {
      ...testAnalytics,
      ["1abc2def"]: {
        details: [testDetail],
      },
    };
    const result = insertVisitDetail("1abc2def", testDetail, testAnalytics);
    assert.deepEqual(expected, result);
  });

  it("hasUserVisited() - it should return true", () => {
    const result = hasUserVisited("iYy4FTIhWe", "4ttQiE", testAnalytics);
    assert.isTrue(result);
  });

  it("hasUserVisited() - it should return false", () => {
    const result = hasUserVisited("abcd123", "4ttQiE", testAnalytics);
    assert.isFalse(result);
  });

  it("getEmailList() - it should return an array of user's emails", () => {
    const result = getEmailList(testUsers);
    assert.deepEqual(result, ["user1@example.com", "user2@example.com"]);
  });

  it("emailExists() - it should return true", () => {
    const result = emailExists(testUsers, "user1@example.com");
    assert.isTrue(result);
  });

  it("emailExists() - it should return false", () => {
    const result = emailExists(testUsers, "user4@example.com");
    assert.isFalse(result);
  });

  it("validEmailPassword() - it should return true", () => {
    const result = validEmailPassword(testUsers, "user1@example.com", "1234");
    assert.isTrue(result);
  });

  it("getUserObject() - it should return a userId", () => {
    const result = getUserObject(testUsers, "user1@example.com");
    assert.equal(result, testUsers["iYy4FTIhWe"]);
  });

  it("getUserObject() - it should return undefined", () => {
    const result = getUserObject({}, "user1@example.com");
    assert.isUndefined(result);
  });

  it("should insert a new URL", () => {
    const newURL = {
      Cm7486Aj: "http://example.com",
    };
    const result = insertNewURL(testURLs, newURL);
    assert.deepEqual(result, { ...testURLs, ...newURL });
  });

  it("should insert a new URL for a given user", () => {
    const newURL = "Cm7486Aj";
    const userId = "apEgcb6KSa";
    const result = insertNewURLForUser(testUsers, userId, newURL);
    assert.deepEqual(result, {
      ...testUsers,
      [userId]: {
        ...testUsers[userId],
        shorturls: [...testUsers[userId].shorturls, newURL],
      },
    });
  });

  it("should get the index of the URL in the array", () => {
    const result = getArrayIndexOfUrl(testUsers, "iYy4FTIhWe", "9sm5xK")
    assert.equal(result, 1)
  })
});
