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
  iYy4FTIhWe: {
    id: "iYy4FTIhWe",
    name: "User 1",
    email: "user1@example.com",
    password: "$2b$10$u9jwjwAFHUpXdxv97kHYBOZnF2wf76esNLcU8VhmCgh19aw.tm5d.",
    shorturls: ["b2xVn2", "9sm5xK"],
  },
  apEgcb6KSa: {
    id: "apEgcb6KSa",
    name: "User 2",
    email: "user2@example.com",
    password: "5678",
    shorturls: ["8e3tv1"],
  },
};

const testURLs = {
  b2xVn2: "http://www.example.ca",
  "9sm5xK": "http://www.example.io",
  c1tI2c: "http://www.example.com.mx",
  "8e3tv1": "http://www.example.com",
  "4ttQiE": "http://example.co.uk",
};

module.exports = { testURLs, testDetail, testAnalytics };
