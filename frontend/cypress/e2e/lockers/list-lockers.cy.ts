describe('List lockers', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/lockers');
  });

  it('lists lockers and sorts by name', () => {
    cy.get('[data-test="main-menu-lockers"]').should('have.attr', 'aria-current', 'page');

    cy.get('[data-test="locker-table-sort-name"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-name-index-0"]').contains('1001');

    cy.get('[data-test="locker-table-sort-name"]').click();

    cy.get('[data-test="locker-table-sort-name"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-name-index-0"]').contains('1042');
  });

  it('lists lockers and sorts by building', () => {
    cy.get('[data-test="locker-table-sort-building"]').click();

    cy.get('[data-test="locker-table-sort-building"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-building-index-0"]').contains('BM');

    cy.get('[data-test="locker-table-sort-building"]').click();

    cy.get('[data-test="locker-table-sort-building"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-building-index-0"]').contains('H');
  });

  it('lists lockers and sorts by floor', () => {
    cy.get('[data-test="locker-table-sort-floor"]').click();

    cy.get('[data-test="locker-table-sort-floor"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-floor-index-0"]').should('not.have.text');

    cy.get('[data-test="locker-table-sort-floor"]').click();

    cy.get('[data-test="locker-table-sort-floor"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-floor-index-0"]').contains('1');
  });

  it('lists lockers and sorts by status', () => {
    cy.get('[data-test="locker-table-sort-status"]').click();

    cy.get('[data-test="locker-table-sort-status"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-status-index-0"]').contains('Anders Andersson');

    cy.get('[data-test="locker-table-sort-status"]').click();

    cy.get('[data-test="locker-table-sort-status"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-status-index-0"]').contains('William Syd');
  });

  it('lists lockers and sorts by lock', () => {
    cy.get('[data-test="locker-table-sort-lock"]').click();

    cy.get('[data-test="locker-table-sort-lock"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-lock-index-0"]').contains('123-C03');

    cy.get('[data-test="locker-table-sort-lock"]').click();

    cy.get('[data-test="locker-table-sort-lock"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-lock-index-0"]').contains('Hänglås');
  });

  it('lists lockers and sorts by code', () => {
    cy.get('[data-test="locker-table-sort-code"]').click();

    cy.get('[data-test="locker-table-sort-code"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'ascending');
    });

    cy.get('[data-test="locker-table-col-code-index-0"]').contains('-');

    cy.get('[data-test="locker-table-sort-code"]').click();

    cy.get('[data-test="locker-table-sort-code"]').within(() => {
      cy.get('.sk-table-sortbutton-icon-sort').should('have.attr', 'data-sortmode', 'descending');
    });

    cy.get('[data-test="locker-table-col-code-index-0"]').contains('Kod 5 - 114047');
  });
});
