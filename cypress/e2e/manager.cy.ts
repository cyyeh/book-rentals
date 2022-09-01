let fakeUsertoModifyEmail = '';
let fakeUsertoModifyPassword = '';

describe('user management', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signin-button').click();
  });

  afterEach(() => {
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it('manager can create a new user with user role', () => {
    const fakeEmail = `${new Date().getTime()}-dev@gmail.com`;
    const fakePassword = 'P@ssw0rd';
    cy.get('#admin-button').click();
    cy.contains('Users').click();
    cy.contains('Create new user').should('be.visible');
    cy.contains('Create new user').click();
    cy.get('#create-user-modal').should('be.visible');
    cy.get('#form-email').clear().type(fakeEmail);
    cy.get('#form-password').clear().type(fakePassword);
    cy.get('#form-name').clear().type(fakeEmail);
    cy.get(':nth-child(2) > .form-check-label').click();
    cy.get('#save-user-button').click();
    cy.get('table', { timeout: 100000 }).should('include.text', fakeEmail);
  });

  it('manager can create a new user with manager role', () => {
    const fakeEmail = `${new Date().getTime()}-dev@gmail.com`;
    const fakePassword = 'P@ssw0rd';
    fakeUsertoModifyEmail = fakeEmail;
    fakeUsertoModifyPassword = fakePassword;
    cy.get('#admin-button').click();
    cy.contains('Users').click();
    cy.contains('Create new user').should('be.visible');
    cy.contains('Create new user').click();
    cy.get('#create-user-modal').should('be.visible');
    cy.get('#form-email').clear().type(fakeEmail);
    cy.get('#form-password').clear().type(fakePassword);
    cy.get('#form-name').clear().type(fakeEmail);
    cy.get(':nth-child(1) > .form-check-label').click();
    cy.get('#save-user-button').click();
    cy.get('table', { timeout: 100000 }).should('include.text', fakeEmail);
  });

  it('manager can modify a user', () => {
    cy.get('#admin-button').click();
    cy.contains('Users').click();
    cy.contains(fakeUsertoModifyEmail, { timeout: 100000 }).click();
    cy.get('#update-user-modal').should('be.visible');
    cy.get('#form-email').should('have.value', fakeUsertoModifyEmail);
    cy.get('#form-name').clear().type(`modified-${fakeUsertoModifyEmail}`)
    cy.get('#save-user-button').click();
    cy.get('table', { timeout: 100000 }).should('include.text', `modified-${fakeUsertoModifyEmail}`);
  });

  it('manager can delete a user', () => {
    cy.get('#admin-button').click();
    cy.contains('Users').click();
    cy.contains(fakeUsertoModifyEmail, { timeout: 100000 }).click();
    cy.get('#delete-user-button').click();
    cy.get('#double-check-modal').should('be.visible');
    cy.get('#double-check-ok-button').click();
    cy.get('table', { timeout: 100000 }).should('not.include.text', fakeUsertoModifyEmail);
  });
});

describe('book management', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signin-button').click();
  });

  afterEach(() => {
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it('manager can create a new book', () => {
    cy.get('#admin-button').click();
    cy.contains('Books').click();
    cy.get('table', { timeout: 100000 }).find('tbody > tr').then((row) => {
      let tableRowNum = row.length;
      cy.contains('Create new book').should('be.visible');
      cy.contains('Create new book').click();
      cy.get('#create-book-modal').should('be.visible');
      cy.get('#save-book-button').click();
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum + 1);
    });
  });

  it('manager can modify a book', () => {
    cy.get('#admin-button').click();
    cy.contains('Books').click();
    cy.get('tbody > tr', { timeout: 100000 }).filter(':contains("red")').then((rows) => {
      let listLength = rows.length;
      cy.get('tbody > tr', { timeout: 100000 }).contains('td', 'red').click();
      cy.get('#update-book-modal').should('be.visible');
      cy.get('label[for="blue"]').click();
      cy.get('#save-book-button').click();
      cy.get('tbody > tr', { timeout: 100000 }).filter(':contains("red")').should('have.length', listLength - 1);
    });
  });

  it('manager can delete a book', () => {
    cy.get('#admin-button').click();
    cy.contains('Books').click();
    cy.get('table', { timeout: 100000 }).find('tbody > tr').then((row) => {
      let tableRowNum = row.length;
      cy.contains('Create new book').should('be.visible');
      cy.contains('Create new book').click();
      cy.get('#create-book-modal').should('be.visible');
      cy.get('#save-book-button').click();
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum + 1);
      cy.get('tbody > :nth-child(1) > :nth-child(1)', { timeout: 100000 }).click();
      cy.get('#update-book-modal').should('be.visible');
      cy.get('#delete-book-button').click();
      cy.get('#double-check-modal').should('be.visible');
      cy.get('#double-check-ok-button').click();
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum);
    });
  });
});

describe('reservation management', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('TEST_URL'));
    cy.url().should('include', '/login');
    cy.get('#email-input').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
    cy.get('#password-input').clear().type(Cypress.env('TEST_ADMIN_PASSWORD'));
    cy.get('#signin-button').click();
  });

  afterEach(() => {
    cy.get('#signout-button').click(); // to clear firebase auth token
  });

  it("manager can filter table content by entering some text", () => {
    cy.get('#admin-button').click();
    cy.contains('Reservations').click();
    cy.get('input[aria-label="search"]').clear().type("xxxx");
    cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', 0);
  });

  it('manager can search by user id', () => {
    cy.get('#admin-button').click();
    cy.contains('Reservations').click();
    cy.get('tbody > tr', { timeout: 100000 }).filter(`:contains(${Cypress.env('TEST_ADMIN_ID')})`).then((rows) => {
      let tableRowNum = rows.length;
      cy.get('input[aria-label="search"]').clear().type(Cypress.env('TEST_ADMIN_ID'));
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum);
    });
  });

  it('manager can search by user email', () => {
    cy.get('#admin-button').click();
    cy.contains('Reservations').click();
    cy.get('tbody > tr', { timeout: 100000 }).filter(`:contains(${Cypress.env('TEST_ADMIN_EMAIL')})`).then((rows) => {
      let tableRowNum = rows.length;
      cy.get('input[aria-label="search"]').clear().type(Cypress.env('TEST_ADMIN_EMAIL'));
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum);
    });
  });

  it('manager can search by book id', () => {
    const bookId = 'ZrQyJwcdak3mXKdODdZi';
    cy.get('#admin-button').click();
    cy.contains('Reservations').click();
    cy.get('tbody > tr', { timeout: 100000 }).filter(`:contains(${bookId})`).then((rows) => {
      let tableRowNum = rows.length;
      cy.get('input[aria-label="search"]').clear().type(bookId);
      cy.get('table', { timeout: 100000 }).find('tbody > tr').should('have.length', tableRowNum);
    });
  });
});
