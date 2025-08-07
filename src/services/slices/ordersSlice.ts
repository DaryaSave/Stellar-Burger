import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TOrder, TOrdersData } from '../../utils/types';
import {
  orderBurgerApi,
  getFeedsApi,
  getOrdersApi,
  getOrderByNumberApi
} from '../../utils/burger-api';
import {
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE,
  WSMessage
} from '../websocket/socketMiddleware';

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (ingredients: string[]) => {
    const data = await orderBurgerApi(ingredients);
    return data;
  }
);

export const getFeeds = createAsyncThunk('orders/getFeeds', async () => {
  const data = await getFeedsApi();
  return data;
});

export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async () => {
    const data = await getOrdersApi();
    return data;
  }
);

export const getOrderByNumber = createAsyncThunk(
  'orders/getOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0];
  }
);

interface IOrdersState {
  currentOrder: TOrder | null;
  orders: TOrder[];
  feeds: TOrder[];
  total: number;
  totalToday: number;
  selectedOrder: TOrder | null;
  loading: boolean;
  error: string | null;

  feedWsConnected: boolean;
  userOrdersWsConnected: boolean;
  wsError: string | null;
}

const initialState: IOrdersState = {
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
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setSelectedOrder: (state, action: PayloadAction<TOrder | null>) => {
      state.selectedOrder = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.order;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка создания заказа';
      })

      .addCase(getFeeds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.loading = false;
        state.feeds = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки ленты заказов';
      })

      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getUserOrders.fulfilled,
        (state, action: PayloadAction<TOrder[]>) => {
          state.loading = false;
          state.orders = action.payload;
        }
      )
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || 'Ошибка загрузки заказов пользователя';
      })

      .addCase(getOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getOrderByNumber.fulfilled,
        (state, action: PayloadAction<TOrder>) => {
          state.loading = false;
          state.selectedOrder = action.payload;
        }
      )
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки заказа';
      })

      .addMatcher(
        (action) => action.type === WS_CONNECTION_SUCCESS,
        (state, action: any) => {
          if (action.payload.wsType === 'feed') {
            state.feedWsConnected = true;
          } else if (action.payload.wsType === 'userOrders') {
            state.userOrdersWsConnected = true;
          }
          state.wsError = null;
        }
      )
      .addMatcher(
        (action) => action.type === WS_CONNECTION_ERROR,
        (state, action: any) => {
          if (action.payload.wsType === 'feed') {
            state.feedWsConnected = false;
          } else if (action.payload.wsType === 'userOrders') {
            state.userOrdersWsConnected = false;
          }
          state.wsError = action.payload.error;
        }
      )
      .addMatcher(
        (action) => action.type === WS_CONNECTION_CLOSED,
        (state, action: any) => {
          if (action.payload.wsType === 'feed') {
            state.feedWsConnected = false;
          } else if (action.payload.wsType === 'userOrders') {
            state.userOrdersWsConnected = false;
          }
        }
      )
      .addMatcher(
        (action) => action.type === WS_GET_MESSAGE,
        (state, action: any) => {
          const { message, wsType } = action.payload;

          if (message.success && message.orders) {
            if (wsType === 'feed') {
              state.feeds = message.orders;
              if (message.total !== undefined) state.total = message.total;
              if (message.totalToday !== undefined)
                state.totalToday = message.totalToday;
            } else if (wsType === 'userOrders') {
              state.orders = message.orders;
            }
          }
        }
      );
  }
});

export const { clearCurrentOrder, setSelectedOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
