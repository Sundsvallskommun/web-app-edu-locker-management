describe('Use create lockers dialog', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/lockers/**', { fixture: 'lockers.json' });
    cy.intercept('POST', '**/api/lockers/**', { fixture: 'create-five-lockers-response.json' });
    cy.intercept('GET', '**/api/schools', { fixture: 'schools.json' });
    cy.intercept('GET', '**/api/me', { fixture: 'me.json' });
    cy.viewport('macbook-15');
    cy.visit('http://localhost:3000/lockers');
  });

  it('creates lockers', () => {
    cy.get('[data-test="open-create-lockers"]').click();

    cy.get('[data-test="create-lockers-building"]').should('have.value', '');
    cy.get('[data-test="create-lockers-building"]').children().should('have.length', 4);
    cy.get('[data-test="create-lockers-buildingFloors"]').should('be.disabled');

    cy.get('[data-test="create-lockers-submit"]').click();
    cy.get('[data-test="open-create-lockers"]').should('exist');

    cy.get('[data-test="create-lockers-building"]').select('Huvudbyggnad');

    cy.get('[data-test="create-lockers-buildingFloors"]').should('have.value', '1');
    cy.get('[data-test="create-lockers-buildingFloors"]').children().should('have.length', 3);

    cy.get('[data-test="create-lockers-lockernames"]').children().should('have.length', 1);
    cy.get('[data-test="create-lockers-autonames"]').should('not.exist');

    cy.get('[data-test="create-lockers-lockercount"]').clear().type('5');
    cy.get('[data-test="create-lockers-autonames"]').next().click();
    cy.get('[data-test="create-lockers-lockername-0"]').type('abc');
    cy.get('[data-test="create-lockers-lockername-1"]').should('have.value', 'abc2');
    cy.get('[data-test="create-lockers-lockername-4"]').should('have.value', 'abc5');

    cy.get('[data-test="create-lockers-lockername-0"]').clear().type('12abc998');
    cy.get('[data-test="create-lockers-lockername-1"]').should('have.value', '12abc999');
    cy.get('[data-test="create-lockers-lockername-4"]').should('have.value', '12abc1002');

    cy.get('[data-test="create-lockers-lockername-0"]').clear().type('99');
    cy.get('[data-test="create-lockers-lockername-1"]').should('have.value', '100');
    cy.get('[data-test="create-lockers-lockername-4"]').should('have.value', '103');

    cy.get('[data-test="create-lockers-submit"]').click();

    cy.get('.sk-snackbar').contains('5');
  });
});
