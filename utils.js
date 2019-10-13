const bcrypt = require("bcrypt");

const UNIQUE_VISITS = "uniquevisits";
const VISITS = "visits";

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

const insertNewURL = (stateURLs, payload) => ({ ...stateURLs, ...payload });

const insertNewURLForUser = (stateUsers, userId, url) => ({
  ...stateUsers,
  [userId]: {
    ...stateUsers[userId],
    shorturls: [...stateUsers[userId].shorturls, url],
  },
});

const insertVisit = (urlId, stateURLs = {}, type) =>
  stateURLs[urlId]
    ? {
        ...stateURLs,
        [urlId]: {
          ...stateURLs[urlId],
          [type]: stateURLs[urlId][type] + 1,
        },
      }
    : stateURLs;

const insertUniqueVisitCount = (urlId, stateURLs = {}) =>
  insertVisit(urlId, stateURLs, UNIQUE_VISITS);

const insertVisitCount = (urlId, stateURLs = {}) =>
  insertVisit(urlId, stateURLs, VISITS);

const insertVisitDetail = (urlId, detailPayload = {}, stateURLs = {}) =>
  stateURLs[urlId]
    ? {
        ...stateURLs,
        [urlId]: {
          ...stateURLs[urlId],
          details: [...stateURLs[urlId].details, detailPayload],
        },
      }
    : stateURLs;

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
  const arrayOfUserObjects = Object.values(stateUsers);
  return arrayOfUserObjects.reduce((accum, userObject) => {
    return [...accum, userObject.email];
  }, []);
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
};

const getUserObject = (stateUsers = {}, email) =>
  Object.values(stateUsers).find((userObject) => userObject.email === email);

const getArrayIndexOfUrl = (stateUsers, userId, urlId) =>
  stateUsers[userId].shorturls.findIndex((url) => url === urlId);

module.exports = {
  emailExists,
  generateRandomString,
  getArrayIndexOfUrl,
  getEmailList,
  getUserObject,
  hashPassword,
  hasUserVisited,
  insertNewURL,
  insertNewURLForUser,
  insertUniqueVisitCount,
  insertVisitCount,
  insertVisitDetail,
  validEmailPassword,
};
