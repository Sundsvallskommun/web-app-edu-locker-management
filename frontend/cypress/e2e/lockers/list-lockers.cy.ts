describe('List lockers', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/lockers');
  });

  it('lists lockers ', () => {
    cy.get('[data-test="main-menu-lockers"]').should('have.attr', 'aria-current', 'page');

    cy.get('[data-test="locker-table-col-name-index-0"]').contains('1001');

    cy.get('.sk-pagination-list').contains('10');

    cy.get('#pagiPageSize').should('have.value', '10');

    cy.get('[data-test="locker-table-body"]').children().should('have.length', 10);
  });

  it('checks locker filters', () => {
    cy.get('[data-test="lockers-filter-buildingFloors"]').should('be.disabled');
    cy.get('[data-test="lockers-filter-building"]').select('Huvudbyggnad');
    cy.get('[data-test="lockers-filter-buildingFloors"]').select('1');
    cy.get('[data-test="lockers-filter-schoolunit"]').select('Skola 2');
    cy.get('[data-test="lockers-filter-buildingFloors"]').should('be.disabled');
    cy.get('[data-test="lockers-filter-building"]').select('TEK');
    cy.get('[data-test="lockers-filter-buildingFloors"]').select('KV');
  });
});
