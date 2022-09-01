describe('sign in', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
  });

  it('user is signing in with correct email and password', () => {
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signin-button').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it('user is signing in with wrong email', () => {
    cy.get('#email-input').clear().type('wrong@gmail.com');
    cy.get('#password-input').clear().type('P@ssw0rd');
    cy.get('#signin-button').click();
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.get('.toast-body').should('have.text', 'Email or password is wrong.');
  });

  it('user is signing in with wrong password', () => {
    cy.get('#email-input').clear().type('admin-dev@gmail.com');
    cy.get('#password-input').clear().type('123456');
    cy.get('#signin-button').click();
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.get('.toast-body').should('have.text', 'Email or password is wrong.');
  });

  it('manager can access the management portal', () => {
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signin-button').click();
    cy.url({ timeout: 100000 }).should('not.include', '/login');
    cy.get('#admin-button').should('be.visible');
    cy.get('#admin-button').click();
    cy.url({ timeout: 100000 }).should('include', '/admin');
  });

  it('user can not access the management portal', () => {
    cy.get('#email-input').clear().type(Cypress.env('TEST_USER_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_USER_PASSWORD'));
    cy.get('#signin-button').click();
    cy.url({ timeout: 100000 }).should('not.include', '/login');
    cy.get('#admin-button').should('not.exist');
  });
});

describe('signup', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
  });

  it('user is signing up with suitable email and password', () => {
    const fakeEmail = `${new Date().getTime()}-dev@gmail.com`;
    cy.get('#email-input').clear().type(fakeEmail);
    cy.get('#password-input').clear().type('P@ssw0rd');
    cy.get('#signup-button').click();
    cy.url({ timeout: 10000 }).should('not.include', '/login');
    cy.get('#welcome-message').should('include.text', fakeEmail);
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it('user is signing up with existed email', () => {
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signup-button').click();
    cy.url({ timeout: 10000 }).should('include', '/login');
    cy.get('.toast-body').should('have.text', 'Email is already in use.');
  });
});
