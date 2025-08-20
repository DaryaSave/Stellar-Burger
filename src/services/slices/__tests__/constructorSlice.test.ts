import reducer, { addIngredient, removeIngredient, moveIngredient, clearConstructor } from '../constructorSlice';
import { TIngredient } from '../../../utils/types';

const bun: TIngredient = {
  _id: 'bun1', name: 'Булка', type: 'bun', proteins: 0, fat: 0, carbohydrates: 0, calories: 0,
  price: 10, image: '', image_large: '', image_mobile: ''
};
const sauce: TIngredient = {
  _id: 'sauce1', name: 'Соус', type: 'sauce', proteins: 0, fat: 0, carbohydrates: 0, calories: 0,
  price: 2, image: '', image_large: '', image_mobile: ''
};
const main: TIngredient = {
  _id: 'main1', name: 'Начинка', type: 'main', proteins: 0, fat: 0, carbohydrates: 0, calories: 0,
  price: 5, image: '', image_large: '', image_mobile: ''
};

describe('constructorSlice reducer', () => {
  it('should handle addIngredient (bun and fillings)', () => {
    let state = reducer(undefined, { type: '@@INIT' } as any);
    state = reducer(state, addIngredient(bun));
    expect(state.bun?._id).toBe('bun1');
    state = reducer(state, addIngredient(main));
    state = reducer(state, addIngredient(sauce));
    expect(state.ingredients).toHaveLength(2);
  });

  it('should handle removeIngredient', () => {
    let state = reducer(undefined, { type: '@@INIT' } as any);
    state = reducer(state, addIngredient(main));
    const id = state.ingredients[0].id;
    state = reducer(state, removeIngredient(id));
    expect(state.ingredients).toHaveLength(0);
  });

  it('should handle moveIngredient', () => {
    let state = reducer(undefined, { type: '@@INIT' } as any);
    state = reducer(state, addIngredient(main));
    state = reducer(state, addIngredient(sauce));
    const a = state.ingredients[0];
    const b = state.ingredients[1];
    state = reducer(state, moveIngredient({ dragIndex: 1, hoverIndex: 0 }));
    expect(state.ingredients[0]).toEqual(b);
    expect(state.ingredients[1]).toEqual(a);
  });

  it('should handle clearConstructor', () => {
    let state = reducer(undefined, { type: '@@INIT' } as any);
    state = reducer(state, addIngredient(bun));
    state = reducer(state, addIngredient(main));
    state = reducer(state, clearConstructor());
    expect(state.bun).toBeNull();
    expect(state.ingredients).toHaveLength(0);
  });
});
