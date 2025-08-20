import rootReducer from '../rootReducer';

describe('rootReducer', () => {
  it('should initialize with expected top-level keys', () => {
    const state = rootReducer(undefined as any, { type: '@@INIT' } as any);
    expect(Object.keys(state).sort()).toEqual(
      ['ingredients', 'burgerConstructor', 'user', 'orders'].sort()
    );
  });

  it('should return initial state for UNKNOWN_ACTION on undefined state', () => {
    const expectedInitialState = {
      ingredients: {
        ingredients: [],
        isLoading: false,
        error: null
      },
      burgerConstructor: {
        bun: null,
        ingredients: []
      },
      user: {
        user: null,
        isAuthenticated: false,
        isAuthChecked: false,
        loading: false,
        error: null
      },
      orders: {
        currentOrder: null,
        orders: [],
        feeds: [],
        total: 0,
        totalToday: 0,
        selectedOrder: null,
        loading: false,
        error: null,
        feedWsConnected: false,
        userOrdersWsConnected: false,
        wsError: null
      }
    };
    const unknownState = rootReducer(undefined, { type: 'UNKNOWN_ACTION' });
    expect(unknownState).toEqual(expectedInitialState);
  });
});
