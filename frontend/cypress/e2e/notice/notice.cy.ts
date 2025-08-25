describe('Send notice', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/pupils/**', { fixture: 'pupils.json' });
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('GET', '**/api/lockers/1234/1549', { fixture: 'locker-1549.json' });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.intercept('POST', '**/api/notice/**', { statusCode: 204, body: {} });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/pupils');
  });

  it('sends a notice to a pupil', () => {
    cy.get('[data-test="pupil-table-col-context-index-0"]').click();
    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-notice"]').click();
    });
    cy.get('[data-test="notice-pupil-modal"]').within(() => {
      cy.get('h1').should('include.text', 'Anna Andersson');
      cy.get('[data-test="locker-list"]').children().should('have.length', 1);
      cy.get('[data-test="locker-list-1549"]').should('be.checked');
      cy.get('[data-test="locker-preview-1549"]').within(() => {
        cy.get('li').eq(0).should('include.text', 'Byggnad: Huvudbyggnad');
        cy.get('li').eq(1).should('include.text', 'Våning: 1');
        cy.get('li').eq(2).should('include.text', 'Lås: Kod - 567812');
      });
      cy.get('[data-test="locker-list-1549"]').parent().click();
      cy.get('[data-test="locker-preview-1549"]').should('not.exist');
      cy.get('[data-test="message"]').type('Test message');
      cy.get('[data-test="preview"]').should('include.text', 'Test message');
      cy.get('button[type="submit"]').click();
    });
    cy.get('[data-test="notice-pupil-modal"]').should('not.exist');
    cy.get('.sk-snackbar-info').should('include.text', 'Information skickad');
  });
});
