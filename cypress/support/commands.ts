// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// แทนที่ -- TypeScript definitions for Cypress object "cy"
// with a new one that includes custom commands e.g. "login"
declare namespace Cypress {
  interface Chainable {

  }
}

// -- ตัวอย่างคำสั่งเสริมที่สามารถเพิ่มได้ --
// Cypress.Commands.add('login', (email, password) => { 
//   cy.get('[data-cy=email]').type(email);
//   cy.get('[data-cy=password]').type(password);
//   cy.get('[data-cy=login-button]').click();
// }); 