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

  afterEach(() => {
    cy.clearCookie('accessToken');
    cy.window().then((win) => win.localStorage.clear());
  });

  it('добавляет ингредиент в конструктор', () => {
    // Проверяем, что начинки нет в конструкторе
    cy.contains('h3', 'Начинки').next('ul')
      .find('[data-cy="ingredient-card"]').first().as('firstIngredientCard');
    cy.get('@firstIngredientCard').find('p').last().invoke('text').then((ingredientName) => {
      cy.get('[data-cy="constructor-dropzone"]').within(() => {
        cy.contains(ingredientName).should('not.exist');
      });
      // Добавляем начинку
      cy.get('@firstIngredientCard').within(() => {
        cy.contains('button', 'Добавить').click();
      });
      // Проверяем, что именно этот ингредиент появился в конструкторе
      cy.get('[data-cy="constructor-dropzone"]').within(() => {
        cy.contains(ingredientName).should('exist');
      });
    });
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

    // Проверяем, что булки и начинки нет в конструкторе
    cy.get('[data-cy="constructor-dropzone"]').within(() => {
      cy.contains('Флюоресцентная булка R2-D3').should('not.exist');
      cy.contains('Филе Люминесцентного тетраодонтимформа').should('not.exist');
    });

    // Добавляем булку
    cy.contains('h3', 'Булки').next('ul')
      .find('[data-cy="ingredient-card"]').first()
      .within(() => {
        cy.contains('button', 'Добавить').click();
      });
    // Проверяем, что булка появилась (верхняя и нижняя)
    cy.get('[data-cy="constructor-dropzone"]').parent().contains('Флюоресцентная булка R2-D3').should('exist');

    // Добавляем начинку
    cy.contains('h3', 'Начинки').next('ul')
      .find('[data-cy="ingredient-card"]').first()
      .within(() => {
        cy.contains('button', 'Добавить').click();
      });
    // Проверяем, что начинка появилась
    cy.get('[data-cy="constructor-dropzone"]').within(() => {
      cy.contains('Филе Люминесцентного тетраодонтимформа').should('exist');
    });

    // Оформляем заказ
    cy.get('[data-cy="order-button"]').click();
    cy.get('[data-cy="order-modal"]').should('be.visible');
    cy.get('[data-cy="order-number"]').should('contain', '12345');
    cy.get('[data-cy="modal-close"]').click();
    cy.get('[data-cy="order-modal"]').should('not.exist');
    // Проверяем, что ингредиенты исчезли из конструктора
    cy.get('[data-cy="constructor-dropzone"]').within(() => {
      cy.contains('Флюоресцентная булка R2-D3').should('not.exist');
      cy.contains('Филе Люминесцентного тетраодонтимформа').should('not.exist');
    });
  });
});
