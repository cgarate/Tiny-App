const bcrypt = require("bcrypt");

const { UNIQUE_VISITS, VISITS } = require("./constants");

const updateStore = (globalStore) => (stateSlice, payload) =>
  (globalStore[stateSlice] = { ...globalStore[stateSlice], ...payload });

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

const insertVisit = (urlId, stateAnalytics = {}, type) =>
  stateAnalytics[urlId]
    ? {
        ...stateAnalytics,
        [urlId]: {
          ...stateAnalytics[urlId],
          [type]: stateAnalytics[urlId][type]
            ? stateAnalytics[urlId][type] + 1
            : 1,
        },
      }
    : {
        ...stateAnalytics,
        [urlId]: {
          [type]: 1,
        },
      };

const insertUniqueVisitCount = (urlId, stateAnalytics = {}) =>
  insertVisit(urlId, stateAnalytics, UNIQUE_VISITS);

const insertVisitCount = (urlId, stateAnalytics = {}) =>
  insertVisit(urlId, stateAnalytics, VISITS);

const insertVisitDetail = (urlId, detailPayload = {}, stateAnalytics = {}) =>
  stateAnalytics[urlId]
    ? {
        ...stateAnalytics,
        [urlId]: {
          ...stateAnalytics[urlId],
          details: stateAnalytics[urlId].details
            ? [...stateAnalytics[urlId].details, detailPayload]
            : [detailPayload],
        },
      }
    : {
        ...stateAnalytics,
        [urlId]: {
          details: [detailPayload],
        },
      };

/**
 *
 * @param {string} userId
 * @param {string} urlId
 * @param {object} stateURLs
 * @description Check if a specific user has visited a given URL
 * @returns boolean
 */
const hasUserVisited = (userId, urlId, stateAnalytics = {}) => {
  const details = stateAnalytics[urlId] && stateAnalytics[urlId].details;
  return stateAnalytics[urlId]
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

const deleteURL = (stateURLs, urlId) => ({
  ...stateURLs,
  [urlId]: {
    ...stateURLs[urlId],
    active: false,
  },
});

const deleteURLForUser = (stateUsers, userId, urlId) => ({
  ...stateUsers,
  [userId]: {
    ...stateUsers[userId],
    shorturls: stateUsers[userId].shorturls.filter((url) => url !== urlId),
  },
});

module.exports = {
  emailExists,
  deleteURL,
  deleteURLForUser,
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
  updateStore,
  validEmailPassword,
};
