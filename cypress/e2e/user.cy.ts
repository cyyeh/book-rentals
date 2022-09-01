describe('user is renting an available book', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
    cy.get('#email-input').clear().type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('#signin-button').click();
  });

  afterEach(() => {
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it('user can see a list of available books', () => {
    cy.contains('Rent a book').click();
    cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length.greaterThan', 0);
  });
});

describe('user is checking his reservations', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
    cy.get('#email-input').clear().type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('#signin-button').click();
  });

  afterEach(() => {
    cy.get('#signout-button').click(); // to clear firebase auth token
  });
});
