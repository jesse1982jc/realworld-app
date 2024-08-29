// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("loginToApplication", () => {
  const userCredentials = {
    user: {
      email: "jcjchuhu2@gmail.com",
      password: "abcd1234",
    },
  };

  cy.request(
    "POST",
    "https://conduit-api.bondaracademy.com/api/users/login",
    userCredentials
  )
    .its("body")
    .then((body) => {
      const token = body.user.token;

      // 保存 token
      cy.wrap(token).as("token");

      cy.visit("/", {
        onBeforeLoad(win) {
          win.localStorage.setItem("jwtToken", token);
        },
      });
    });
});
