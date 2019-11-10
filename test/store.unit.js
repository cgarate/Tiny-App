const { assert } = require("chai");
const updateStore = require("../store");

const { USERS } = require("../constants");

mockStore = { urlDatabase: {}, analytics: {}, users: {} };
const testUpdateStore = updateStore(mockStore);

describe("updateStore", () => {
  it("should update the user store", () => {
    testUpdateStore(
      USERS,
      {
        abcdef123456: {
          id: "abcdef123456",
          name: "User New",
          email: "userNew@example.com",
          password: "1111",
          shorturls: ["aws34ok"],
        },
      },
    );
    const expected = mockStore.users["abcdef123456"];

    assert.isDefined(expected)
  });
});
