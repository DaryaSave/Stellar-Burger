import reducer, { fetchIngredients } from '../ingredientsSlice';
import { AnyAction } from '@reduxjs/toolkit';

const initialState = {
  ingredients: [],
  isLoading: false,
  error: null as string | null
};

describe('ingredientsSlice reducer', () => {
  it('should set isLoading true on fetchIngredients.pending', () => {
    const state = reducer(initialState as any, { type: fetchIngredients.pending.type } as AnyAction);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should set data and isLoading false on fetchIngredients.fulfilled', () => {
    const payload = [{ _id: '1', name: 'Булка', type: 'bun', proteins: 0, fat: 0, carbohydrates: 0, calories: 0, price: 10, image: '', image_large: '', image_mobile: '' }];
    const state = reducer(initialState as any, { type: fetchIngredients.fulfilled.type, payload } as AnyAction);
    expect(state.isLoading).toBe(false);
    expect(state.ingredients).toEqual(payload);
  });

  it('should set error and isLoading false on fetchIngredients.rejected', () => {
    const state = reducer(initialState as any, { type: fetchIngredients.rejected.type, payload: 'Ошибка' } as AnyAction);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Ошибка');
  });
});
