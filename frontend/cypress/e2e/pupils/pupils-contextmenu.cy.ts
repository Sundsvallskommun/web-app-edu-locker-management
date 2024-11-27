describe('Use pupils context menu', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/pupils/**', { fixture: 'pupils.json' });
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/pupils');
  });

  it('opens the context menu for a single pupils', () => {
    cy.get('[data-test="pupil-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-one"]').should('exist');
      cy.get('[data-test="pupil-menu-unassign-all"]').should('not.exist');
      cy.get('[data-test="pupil-menu-assign"]').should('not.exist');
    });

    cy.get('[data-test="pupil-table-col-context-index-1"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-one"]').should('not.exist');
      cy.get('[data-test="pupil-menu-unassign-all"]').should('not.exist');
      cy.get('[data-test="pupil-menu-assign"]').should('exist');
    });

    cy.get('[data-test="pupil-table-col-context-index-4"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-one"]').should('not.exist');
      cy.get('[data-test="pupil-menu-unassign-all"]').should('exist');
      cy.get('[data-test="pupil-menu-unassign-3001"]').should('exist');
      cy.get('[data-test="pupil-menu-unassign-3031"]').should('exist');
      cy.get('[data-test="pupil-menu-assign"]').should('not.exist');
      cy.get('.sk-popup-menu-items').children().should('have.length', 3);
    });
  });

  it('opens the context menu for multiple selected pupils', () => {
    cy.get('[data-test="pupil-table-multi-context"]').find('[data-test="context-menu-button"]').should('be.disabled');
    cy.get('[data-test="pupil-table-select-all"]').click();
    cy.get('[data-test="pupil-table-multi-context"]').find('[data-test="context-menu-button"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-multi-assign"]').should('include.text', '4');
      cy.get('[data-test="pupil-menu-multi-unassign"]').should('include.text', '6');
    });
  });

  it('unassigns a locker from a pupil with one locker', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-one-locker-response.json' });

    cy.get('[data-test="pupil-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-one"]').click();
    });

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('1549');
      cy.contains('Anna Andersson (SC1CLASS1)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('unassigns a locker from a pupil with two lockers', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-one-locker-response.json' });

    cy.get('[data-test="pupil-table-col-context-index-4"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-3001"]').click();
    });

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('3001');
      cy.contains('Adrian Hansson (SC1CLASS4)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success');

    cy.get('[data-test="pupil-table-col-context-index-4"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-3031"]').click();
    });

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('3031');
      cy.contains('Adrian Hansson (SC1CLASS4)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('unassigns both lockers from a pupil with two lockers', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-two-lockers-response.json' });

    cy.get('[data-test="pupil-table-col-context-index-4"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="pupil-menu-unassign-all"]').click();
    });

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('3001');
      cy.contains('3031');
      cy.contains('Adrian Hansson (SC1CLASS4)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success').should('include.text', '2 skåp');
  });

  it('unassigns multiple lockers from multiple pupils', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-multiple-lockers-response.json' });

    cy.get('[data-test="pupil-table-select-all"]').click();
    cy.get('[data-test="pupil-table-multi-context"]').click();
    cy.get('[data-test="pupil-menu-multi-unassign"]').click();

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('7 skåp');
      cy.contains('Adrian Hansson (SC1CLASS4)');
      cy.get('ul').children().should('have.length', 6);
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success').should('include.text', '7 skåp');
  });
});
