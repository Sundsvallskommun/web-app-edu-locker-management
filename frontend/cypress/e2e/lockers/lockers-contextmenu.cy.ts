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

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('1001');
      cy.contains('Karin Andersson (CL1SCHOOL1)');
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
      cy.contains('Karin Andersson (CL1SCHOOL1)');
      cy.contains('Eva Bäckman (CL1SCHOOL1)');

      cy.get('button.sk-btn-primary').click();
    });

    cy.get('.sk-snackbar-success').contains('7');
  });

  it('assigns a locker', () => {
    cy.intercept('PATCH', '**/api/lockers/assign/**', { fixture: 'assign-one-locker-response.json' });
    cy.intercept('GET', '**/api/pupils/searchfree/**', { fixture: 'search-pupils.json' });
    cy.intercept('GET', '**/api/codelocks/**', { fixture: 'codelock.json' });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-assign"]').should('not.exist');
    });

    cy.get('[data-test="locker-table-col-context-index-8"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-assign"]').should('not.exist');
    });

    cy.get('[data-test="locker-table-col-context-index-7"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-assign"]').click();
    });

    cy.get('[data-test="assign-locker-dialog"]').within(() => {
      cy.contains('1040');
      cy.contains('123-C64');
      cy.get('[data-test="assign-pupil-submit"]').should('be.disabled');
      cy.get('[data-test="assign-search-pupil"]').type('anna');
      cy.contains('Anna Andersson (CL1SCHOOL1)').click();
      cy.get('[data-test="assign-pupil-submit"]').click();
    });

    cy.get('.sk-snackbar-success');
  });

  it('edits a locker', () => {
    cy.intercept('GET', '**/api/codelocks/1234/123-C46', { fixture: 'codelock2.json' });
    cy.intercept('GET', '**/api/codelocks/1234/123-C68', { fixture: 'codelock3.json' });
    cy.intercept('GET', '**/api/codelocks/1234', { fixture: 'codelocks.json' });
    cy.intercept('PATCH', '**/api/codelocks/**', { fixture: 'codelock2.json' });
    cy.intercept('PATCH', '**/api/lockers/**', { data: true });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-edit"]').click();
    });

    cy.get('[data-test="edit-locker-dialog"]').within(() => {
      cy.get('h1').contains('1001');
      cy.get('[data-test="locker-edit-building"]').should('have.value', 'Huvudbyggnad');
      cy.get('[data-test="locker-edit-building"]').children().should('have.length', '3');
      cy.get('[data-test="locker-edit-buildingFloors"]').should('have.value', '2');
      cy.get('[data-test="locker-edit-buildingFloors"]').children().should('have.length', '3');

      cy.get('[data-test="locker-edit-building"]').select('Flygeln');
      cy.get('[data-test="locker-edit-buildingFloors"]').should('be.disabled');

      cy.get('[data-test="locker-edit-name"]').should('have.value', '1001');
      cy.get('[data-test="locker-edit-locktype-code"]').should('be.checked');
      cy.get('[data-test="locker-edit-locktype-key"]').should('not.be.checked');
      cy.get('[data-test="locker-edit-codelockid-unset"]').should('not.exist');
      cy.get('[data-test="locker-edit-codelockid-set"]').should('have.value', '123-C46');
      cy.get('[data-test="locker-edit-code"]').should('have.value', '2');
      cy.get('[data-test="locker-edit-pupil"]').should('have.value', 'Karin Andersson (CL1SCHOOL1)');

      cy.get('[data-test="locker-edit-locktype-key"]').click();
      cy.get('[data-test="locker-edit-codelockid-set"]').should('not.exist');
      cy.get('[data-test="locker-edit-code"]').should('not.exist');

      cy.get('[data-test="locker-edit-locktype-code"]').click();
      cy.get('[data-test="locker-edit-codelockid-reset"]').click();
    });

    cy.get('[data-test="edit-locker-remove-codelock-dialog"]').within(() => {
      cy.contains('123-C46');
      cy.contains('1001');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('[data-test="edit-locker-dialog"]').within(() => {
      cy.get('[data-test="locker-edit-codelockid-set"]').should('not.exist');
      cy.get('[data-test="locker-edit-code"]').should('be.disabled');
      cy.get('[data-test="locker-edit-codelockid-unset"]').click();
      cy.get('[data-test="locker-edit-codelockid-unset-list"]').contains('123-C68').click();
      cy.get('[data-test="locker-edit-code"]').should('have.value', '5');
      cy.get('[data-test="locker-edit-code"]').children().should('have.length', 4);
      cy.get('[data-test="locker-edit-code"]').select('1');

      cy.get('[data-test="edit-locker-submit"]').click();
    });

    cy.get('.sk-snackbar-success').should('have.length', 2);
  });

  it('unassigns and assigns a locker from the edit dialog', () => {
    cy.intercept('PATCH', '**/api/lockers/unassign/**', { fixture: 'unassign-one-locker-response.json' });
    cy.intercept('GET', '**/api/codelocks/1234/123-C46', { fixture: 'codelock2.json' });
    cy.intercept('GET', '**/api/codelocks/1234', { fixture: 'codelocks.json' });
    cy.intercept('PATCH', '**/api/lockers/**', { data: true });
    cy.intercept('PATCH', '**/api/lockers/assign/**', { fixture: 'assign-one-locker-response.json' });
    cy.intercept('GET', '**/api/pupils/searchfree/**', { fixture: 'search-pupils.json' });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-edit"]').click();
    });

    cy.get('[data-test="edit-locker-dialog"]').within(() => {
      cy.get('[data-test="locker-edit-pupil"]').should('have.value', 'Karin Andersson (CL1SCHOOL1)');
      cy.get('[data-test="edit-locker-pupil-assignment"]').click();
    });

    cy.get('[data-test="unassign-locker-dialog"]').within(() => {
      cy.contains('1001');
      cy.contains('Karin Andersson (CL1SCHOOL1)');
      cy.get('button.sk-btn-primary').click();
    });

    cy.get('[data-test="edit-locker-dialog"]').within(() => {
      cy.get('[data-test="locker-edit-pupil"]').should('have.value', 'Ingen (ledigt)');
      cy.get('[data-test="edit-locker-pupil-assignment"]').click();
    });

    cy.get('[data-test="assign-locker-dialog"]').within(() => {
      cy.contains('1001');
      cy.get('[data-test="assign-pupil-submit"]').should('be.disabled');
      cy.get('[data-test="assign-search-pupil"]').type('anna');
      cy.contains('Anna Andersson (CL1SCHOOL1)').click();
      cy.get('[data-test="assign-pupil-submit"]').click();
    });

    cy.get('[data-test="edit-locker-dialog"]').within(() => {
      cy.get('[data-test="locker-edit-pupil"]').should('have.value', 'Anna Andersson (CL1SCHOOL1)');
      cy.get('[data-test="edit-locker-submit"]').click();
    });
    cy.get('.sk-snackbar-success').should('exist');
  });

  it('changes codes on a codelock', () => {
    cy.intercept('GET', '**/api/codelocks/1234/123-C46', { fixture: 'codelock2.json' });
    cy.intercept('GET', '**/api/codelocks/1234', { fixture: 'codelocks.json' });
    cy.intercept('PATCH', '**/api/codelocks/**', { fixture: 'codelock2.json' });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-edit"]').click();
    });

    cy.get('[data-test="locker-edit-code"]').should('have.value', '2');
    cy.get('[data-test="locker-edit-edit-codes"]').click();

    cy.get('[data-test="edit-codes-dialog"]').within(() => {
      cy.get('[data-test="edit-codes-codelockid"]').should('have.value', '123-C46');
      cy.get('[data-test="edit-codes-locker-name"]').should('have.value', '1001');
      cy.get('[data-test="edit-code-code2-radio"]').should('be.checked');
      cy.get('[data-test="edit-code-code2-input"]').clear();
      cy.get('[data-test="edit-code-submit"]').click();
      cy.get('[data-test="edit-code-code3-radio"]').click();
      cy.get('[data-test="edit-code-submit"]').click();
    });
    cy.get('[data-test="locker-edit-code"]').should('have.value', '3');

    cy.get('[data-test="edit-locker-submit"]').click();
  });

  it('creates a new codelock', () => {
    cy.intercept('GET', '**/api/codelocks/1234/123-C46', { fixture: 'codelock2.json' });
    cy.intercept('GET', '**/api/codelocks/1234/newlock', { fixture: 'new_codelock.json' });
    cy.intercept('GET', '**/api/codelocks/1234', { fixture: 'codelocks.json' });
    cy.intercept('PATCH', '**/api/codelocks/**', { fixture: 'codelock2.json' });
    cy.intercept('POST', '**/api/codelocks/**', { fixture: 'new_codelock.json' });
    cy.intercept('PATCH', '**/api/lockers/**', { data: true });

    cy.get('[data-test="locker-table-col-context-index-0"]').click();

    cy.get('.sk-popup-menu-sm[data-open="true"]').within(() => {
      cy.get('[data-test="locker-menu-edit"]').click();
    });

    cy.get('[data-test="locker-edit-new-codelock"]').should('not.exist');

    cy.get('[data-test="locker-edit-codelockid-reset"]').click();
    cy.get('[data-test="edit-locker-remove-codelock-submit"]').click();

    cy.get('[data-test="locker-edit-new-codelock"]').click();

    cy.get('[data-test="edit-codes-dialog"]').within(() => {
      cy.get('[data-test="edit-codes-codelockid"]').type('newlock');
      cy.get('[data-test="edit-codes-locker-name"]').should('have.value', '1001');
      cy.get('[data-test="edit-code-code1-input"]').type('123456');
      cy.get('[data-test="edit-code-code2-input"]').type('234567');
      cy.get('[data-test="edit-code-code3-input"]').type('345678');
      cy.get('[data-test="edit-code-submit"]').click();
      cy.get('[data-test="edit-code-code3-radio"]').click();
      cy.get('[data-test="edit-code-submit"]').click();
    });
    cy.get('[data-test="locker-edit-code"]').should('have.value', '3');
    cy.get('[data-test="locker-edit-code"]').children().should('have.length', '3');

    cy.get('[data-test="edit-locker-submit"]').click();

    cy.get('.sk-snackbar-success').should('have.length', 3);
  });
});
