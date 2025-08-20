/// <reference types="cypress" />

describe('Burger Constructor', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', {
      statusCode: 200,
      fixture: 'ingredients.json'
    }).as('getIngredients');

    cy.intercept('POST', '**/api/auth/token', {
      statusCode: 200,
      body: {
        success: true,
        accessToken: 'test-access',
        refreshToken: 'test-refresh'
      }
    }).as('refreshToken');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('postOrder');

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('refreshToken', '1');
      }
    });

    cy.wait('@getIngredients');
  });

  it('добавляет ингредиент в конструктор', () => {
    cy.contains('h3', 'Начинки').next('ul')
      .find('[data-cy="ingredient-card"]').first()
      .within(() => {
        cy.contains('button', 'Добавить').click();
      });
    cy.get('[data-cy="constructor-ingredient"]').should('exist');
  });

  it('открывает и закрывает модалку ингредиента (крестик и оверлей)', () => {
    cy.get('[data-cy="ingredient-card"]', { timeout: 10000 }).first().as('firstCard');
    cy.get('@firstCard').contains('Флюоресцентная булка R2-D3');
    cy.get('@firstCard').click();
    cy.get('[data-cy="ingredient-modal"]').should('be.visible');
    cy.get('[data-cy="ingredient-modal"]').contains('Флюоресцентная булка R2-D3');
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="ingredient-modal"]').should('not.exist');
    cy.get('[data-cy="ingredient-card"]').first().click();
    cy.get('[data-cy="ingredient-modal"]').should('be.visible');
    cy.get('[data-cy="modal-overlay"]').click({ force: true });
    cy.get('[data-cy="ingredient-modal"]').should('not.exist');
  });

  it('оформляет заказ и очищает конструктор', () => {
    cy.setCookie('accessToken', 'test-access');
    cy.window().then((win) => {
      win.localStorage.setItem('refreshToken', '1');
    });

    cy.contains('h3', 'Булки').next('ul')
      .find('[data-cy="ingredient-card"]').first()
      .within(() => {
        cy.contains('button', 'Добавить').click();
      });
    cy.contains('h3', 'Начинки').next('ul')
      .find('[data-cy="ingredient-card"]').first()
      .within(() => {
        cy.contains('button', 'Добавить').click();
      });

    // Оформляем заказ
    cy.get('[data-cy="order-button"]').click();
    cy.get('[data-cy="order-modal"]').should('be.visible');
    cy.get('[data-cy="order-number"]').should('contain', '12345');
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="order-modal"]').should('not.exist');
    cy.get('[data-cy="constructor-ingredient"]').should('not.exist');

  cy.clearCookie('accessToken');
  cy.window().then((win) => win.localStorage.clear());
  });
});
