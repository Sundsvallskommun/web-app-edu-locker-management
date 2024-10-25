describe('Use lockers context menu', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('PATCH', '**/api/lockers/status/**', { fixture: 'edit-one-locker-response.json' });
    cy.intercept('DELETE', '**/api/lockers/**', { data: true });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/lockers');
  });

  it('deletes a locker', () => {
    cy.get('[data-test="locker-table-col-context-index-0"]').click();
    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-delete"]').should('not.exist');
    });
    cy.get('#pagePageSize').select('15');

    cy.get('[data-test="locker-table-col-context-index-10"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-delete"]').click();
    });

    cy.get('.sk-modal-dialog').within(() => {
      cy.contains('1040');
      cy.get('button.sk-btn-primary').click();
    });
    cy.get('.sk-snackbar-success');
  });

  it('multiselects and deletes many lockers', () => {
    cy.get('#pagePageSize').select('15');
    cy.get('[data-test="locker-table-multi-context"]').find('button').should('have.attr', 'disabled');

    cy.get('[data-test="locker-table-select-all"]').click();
    cy.get('[data-test="locker-table-multi-context"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-multi-should-empty"]');
      cy.get('[data-test="locker-menu-multi-is-free"]');
      cy.get('[data-test="locker-menu-multi-delete"]').contains('2');
      cy.get('[data-test="locker-menu-multi-delete"]').click();
    });
    cy.get('.sk-modal-dialog').within(() => {
      cy.contains('2');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('changes locker statuses', () => {
    cy.get('[data-test="locker-table-col-context-index-0"]').click();
    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-should-empty"]').should('not.exist');
      cy.get('[data-test="locker-menu-is-free"]').should('not.exist');
    });
    cy.get('#pagePageSize').select('15');

    cy.get('[data-test="locker-table-col-context-index-10"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-is-free"]').should('not.exist');
      cy.get('[data-test="locker-menu-should-empty"]').click();
    });

    cy.get('.sk-snackbar-success');

    cy.get('[data-test="locker-table-col-context-index-11"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-should-empty"]').should('not.exist');
      cy.get('[data-test="locker-menu-is-free"]').click();
    });

    cy.get('.sk-snackbar-success');
  });
});
