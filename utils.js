const bcrypt = require("bcrypt");

const hashPassword = (password, saltRounds = 10) => {
  let salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
};

const generateRandomString = (length, chars) => {
  let result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};

const insertUniqueVisitCount = (urlId, stateURLs = {}) => {
  return stateURLs[urlId]
    ? {
        ...stateURLs,
        [urlId]: {
          ...stateURLs[urlId],
          uniquevisits: stateURLs[urlId].uniquevisits + 1,
        },
      }
    : stateURLs;
};

const insertVisitCount = (urlId, stateURLs = {}) => {
  return stateURLs[urlId]
    ? {
        ...stateURLs,
        [urlId]: { ...stateURLs[urlId], visits: stateURLs[urlId].visits + 1 },
      }
    : stateURLs;
};

const insertVisitDetail = (urlId, detailPayload = {}, stateURLs = {}) => {
  return stateURLs[urlId]
    ? {
        ...stateURLs,
        [urlId]: {
          ...stateURLs[urlId],
          details: [...stateURLs[urlId].details, detailPayload],
        },
      }
    : stateURLs;
};

/**
 *
 * @param {string} userId
 * @param {string} urlId
 * @param {object} stateURLs
 * @description Check if a specific user has visited a given URL
 * @returns boolean
 */
const hasUserVisited = (userId, urlId, stateURLs = {}) => {
  const details = stateURLs[urlId] && stateURLs[urlId].details;
  return stateURLs[urlId]
    ? details.filter((detail) => detail.visitorID === userId).length > 0
    : false;
};

const getEmailList = (stateUsers) => {
  let arrayOfUserIDs = Object.keys(stateUsers);
  let resArray = [];
  for (let item of arrayOfUserIDs) {
    resArray.push(stateUsers[item].email);
  }
  return resArray;
};

const emailExists = (stateUsers, email) =>
  getEmailList(stateUsers).some((userEmail) => {
    return userEmail === email;
  });

const validEmailPassword = (stateUsers = undefined, email, password) => {
  const arrayOfUserObjects = stateUsers ? Object.values(stateUsers) : [];
  return (
    arrayOfUserObjects.filter(
      (userObject) =>
        userObject.email === email &&
        bcrypt.compareSync(password, userObject.password),
    ).length > 0
  );
}

function getUserID(o, email, password) {
  let arrayOfUserIDs = Object.keys(o);
  for (let item of arrayOfUserIDs) {
    if (
      o[item].email === email &&
      bcrypt.compareSync(password, o[item].password)
    ) {
      return o[item].id;
    }
  }
  return null;
}

module.exports = {
  emailExists,
  generateRandomString,
  getEmailList,
  hashPassword,
  hasUserVisited,
  insertUniqueVisitCount,
  insertVisitCount,
  insertVisitDetail,
  validEmailPassword,
};
