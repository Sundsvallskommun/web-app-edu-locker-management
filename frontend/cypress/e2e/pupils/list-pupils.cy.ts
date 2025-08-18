describe('List pupils', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/pupils/**', { fixture: 'pupils.json' });
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/pupils');
  });

  it('lists pupils ', () => {
    cy.get('[data-test="main-menu-pupils"]').should('have.attr', 'aria-current', 'page');

    cy.get('[data-test="pupil-table-col-name-index-0"]').contains('Anna Andersson');

    cy.get('.sk-pagination-list').contains('10');

    cy.get('#pagiPageSize').should('have.value', '10');

    cy.get('[data-test="pupil-table-body"]').children().should('have.length', 10);
  });

  it('checks pupil filters', () => {
    cy.get('[data-test="pupils-filter-schoolunit"]').children().should('have.length', 2);
    cy.get('[data-test="pupils-filter-class"]').children().should('have.length', 5);
    cy.get('[data-test="pupils-filter-schoolunit"]').select('Skola 2');
    cy.get('[data-test="pupils-filter-class"]').children().should('have.length', 3);

    cy.get('[data-test="pupils-filter-locker-with"]');
    cy.get('[data-test="pupils-filter-locker-without"]');
  });
});
