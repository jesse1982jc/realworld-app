describe("Test with backend", () => {
  beforeEach("login to application", () => {
    cy.loginToApplication();
  });

  it("first", () => {
    cy.log("Heyyyyy we logged in");
  });
});

// new URL: 請忽略舊的URL
// APP: https//conduit.bondaracademy.com
// API: https//conduit-api.bondaracademy.com
