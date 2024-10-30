describe('Use lockers context menu', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('DELETE', '**/api/lockers/**', { data: true });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/lockers');
  });

  it('deletes a locker', () => {
    cy.get('[data-test="locker-table-col-context-index-0"]').click();
    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-delete"]').should('not.exist');
    });

    cy.get('[data-test="locker-table-col-context-index-7"]').click();

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
    cy.get('[data-test="locker-table-multi-context"]').find('button').should('have.attr', 'disabled');

    cy.get('[data-test="locker-table-select-all"]').click();
    cy.get('[data-test="locker-table-multi-context"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-multi-delete"]').contains('3');
      cy.get('[data-test="locker-menu-multi-delete"]').click();
    });
    cy.get('.sk-modal-dialog').within(() => {
      cy.contains('3');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success').should('have.length', 3);
  });

  it('changes single locker statuses', () => {
    cy.intercept('PATCH', '**/api/lockers/status/**', { fixture: 'edit-one-locker-response.json' });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();
    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-should-empty"]').should('not.exist');
      cy.get('[data-test="locker-menu-is-free"]').should('not.exist');
    });

    cy.get('[data-test="locker-table-col-context-index-7"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-is-free"]').should('not.exist');
      cy.get('[data-test="locker-menu-should-empty"]').click();
    });

    cy.get('.sk-snackbar-success');

    cy.get('[data-test="locker-table-col-context-index-8"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-should-empty"]').should('not.exist');
      cy.get('[data-test="locker-menu-is-free"]').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('changes multi locker statuses', () => {
    cy.intercept('PATCH', '**/api/lockers/status/**', { fixture: 'edit-two-lockers-response.json' });

    cy.get('[data-test="locker-table-multi-context"]').find('button').should('have.attr', 'disabled');

    cy.get('[data-test="locker-table-select-all"]').click();
    cy.get('[data-test="locker-table-multi-context"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-multi-is-free"]').should('exist');
      cy.get('[data-test="locker-menu-multi-should-empty"]').click();
    });

    cy.get('.sk-snackbar-success').contains('2');
  });

  it('unassigns a locker', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-one-locker-response.json' });

    cy.get('[data-test="locker-table-col-context-index-7"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-unassign"]').should('not.exist');
    });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-unassign"]').click();
    });

    cy.get('.sk-modal-dialog').within(() => {
      cy.contains('1001');
      cy.contains('Karin Andersson (TE21DES)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('unassigns multiple lockers', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-multiple-lockers-response.json' });

    cy.get('[data-test="locker-table-multi-context"]').find('button').should('have.attr', 'disabled');

    cy.get('[data-test="locker-table-select-all"]').click();
    cy.get('[data-test="locker-table-multi-context"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-multi-unassign"]').should('include.text', '7').click();
    });

    cy.get('.sk-modal-dialog').within(() => {
      cy.contains('7');
      cy.contains('Karin Andersson (TE21DES)');
      cy.contains('Eva Bäckman (CL21ABC)');

      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success').contains('7');
  });
});
