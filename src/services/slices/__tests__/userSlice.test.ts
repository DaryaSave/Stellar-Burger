import reducer, {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  clearError,
  setAuthChecked
} from '../userSlice';
import { TUser } from '../../../utils/types';

// Mock cookie helpers used inside slice side-effects
jest.mock('../../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn()
}));

// Minimal localStorage polyfill for reducer side-effects
beforeAll(() => {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    key: (i: number) => Object.keys(store)[i] || null,
    length: 0
  } as unknown as Storage;
});

const user: TUser = { email: 'a@b.c', name: 'Alice' };

describe('userSlice reducer', () => {
  it('registerUser.pending sets loading and clears error', () => {
    const state = reducer(undefined, { type: registerUser.pending.type } as any);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('registerUser.fulfilled stores user and flags', () => {
    let state = reducer(undefined, { type: registerUser.pending.type } as any);
    state = reducer(state, { type: registerUser.fulfilled.type, payload: user } as any);
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAuthChecked).toBe(true);
  });

  it('loginUser.fulfilled stores user and flags', () => {
    let state = reducer(undefined, { type: loginUser.pending.type } as any);
    state = reducer(state, { type: loginUser.fulfilled.type, payload: user } as any);
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAuthChecked).toBe(true);
  });

  it('logoutUser.fulfilled resets auth state', () => {
    let state = reducer(undefined, { type: loginUser.fulfilled.type, payload: user } as any);
    state = reducer(state, { type: logoutUser.fulfilled.type } as any);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('getUser.fulfilled sets user and flags; rejected resets auth and user', () => {
    let state = reducer(undefined, { type: getUser.pending.type } as any);
    state = reducer(state, { type: getUser.fulfilled.type, payload: user } as any);
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAuthChecked).toBe(true);

    state = reducer(state, { type: getUser.rejected.type } as any);
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAuthChecked).toBe(true);
  });

  it('updateUser.fulfilled updates user', () => {
    let state = reducer(undefined, { type: loginUser.fulfilled.type, payload: user } as any);
    const updated = { ...user, name: 'Bob' };
    state = reducer(state, { type: updateUser.fulfilled.type, payload: updated } as any);
    expect(state.user).toEqual(updated);
  });

  it('reducers: clearError and setAuthChecked', () => {
    let state = reducer(undefined, { type: registerUser.rejected.type, error: { message: 'e' } } as any);
    state = reducer(state, clearError());
    expect(state.error).toBeNull();
    state = reducer(state, setAuthChecked());
    expect(state.isAuthChecked).toBe(true);
  });
});
