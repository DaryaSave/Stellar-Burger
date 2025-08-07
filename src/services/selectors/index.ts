import { RootState } from '../store';

export const getIngredients = (state: RootState) =>
  state.ingredients.ingredients;
export const getIngredientsLoading = (state: RootState) =>
  state.ingredients.isLoading;
export const getIngredientsError = (state: RootState) =>
  state.ingredients.error;

export const getConstructorBun = (state: RootState) =>
  state.burgerConstructor.bun;
export const getConstructorIngredients = (state: RootState) =>
  state.burgerConstructor.ingredients;

export const getUser = (state: RootState) => state.user.user;
export const getIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;
export const getIsAuthChecked = (state: RootState) => state.user.isAuthChecked;
export const getUserLoading = (state: RootState) => state.user.loading;
export const getUserError = (state: RootState) => state.user.error;

export const getCurrentOrder = (state: RootState) => state.orders.currentOrder;
export const getFeeds = (state: RootState) => state.orders.feeds;
export const getUserOrders = (state: RootState) => state.orders.orders;
export const getSelectedOrder = (state: RootState) =>
  state.orders.selectedOrder;
export const getOrdersLoading = (state: RootState) => state.orders.loading;
export const getOrdersError = (state: RootState) => state.orders.error;
export const getFeedsTotal = (state: RootState) => state.orders.total;
export const getFeedsTotalToday = (state: RootState) => state.orders.totalToday;
