describe('Use pupils context menu', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/pupils/**', { fixture: 'pupils.json' });
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
});
