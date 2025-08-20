import rootReducer from '../rootReducer';

describe('rootReducer', () => {
  it('should initialize with expected top-level keys', () => {
    const state = rootReducer(undefined as any, { type: '@@INIT' } as any);
    expect(Object.keys(state).sort()).toEqual(
      ['ingredients', 'burgerConstructor', 'user', 'orders'].sort()
    );
  });

  it('should return initial state for UNKNOWN_ACTION on undefined state', () => {
    const initState = rootReducer(undefined as any, { type: '@@INIT' } as any);
    const unknownState = rootReducer(undefined as any, { type: 'UNKNOWN_ACTION' } as any);
    expect(unknownState).toEqual(initState);
  });
});
