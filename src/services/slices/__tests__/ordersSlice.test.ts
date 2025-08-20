import reducer, {
  createOrder,
  getFeeds,
  getUserOrders,
  getOrderByNumber,
  clearCurrentOrder,
  setSelectedOrder
} from '../ordersSlice';
import {
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE
} from '../../websocket/socketMiddleware';

const makeOrder = (overrides: Partial<any> = {}) => ({
  _id: 'ord1',
  status: 'done',
  name: 'Заказ №1',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  number: 12345,
  ingredients: ['ing1', 'ing2'],
  ...overrides
});

describe('ordersSlice reducer', () => {
  it('createOrder.pending sets loading and clears error', () => {
    const state = reducer(undefined, { type: createOrder.pending.type } as any);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('createOrder.fulfilled sets currentOrder and clears loading', () => {
    const payload = { order: makeOrder() };
    let state = reducer(undefined, { type: createOrder.pending.type } as any);
    state = reducer(state, { type: createOrder.fulfilled.type, payload } as any);
    expect(state.loading).toBe(false);
    expect(state.currentOrder).toEqual(payload.order);
  });

  it('createOrder.rejected sets error and clears loading', () => {
    const action = { type: createOrder.rejected.type, error: { message: 'fail' } } as any;
    const state = reducer(undefined, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('fail');
  });

  it('getFeeds.fulfilled updates feeds and totals', () => {
    const payload = {
      orders: [makeOrder({ _id: 'o1' }), makeOrder({ _id: 'o2', number: 2 })],
      total: 100,
      totalToday: 10
    };
    let state = reducer(undefined, { type: getFeeds.pending.type } as any);
    state = reducer(state, { type: getFeeds.fulfilled.type, payload } as any);
    expect(state.loading).toBe(false);
    expect(state.feeds).toHaveLength(2);
    expect(state.total).toBe(100);
    expect(state.totalToday).toBe(10);
  });

  it('getUserOrders.fulfilled updates orders list', () => {
    const payload = [makeOrder({ _id: 'u1' })];
    let state = reducer(undefined, { type: getUserOrders.pending.type } as any);
    state = reducer(state, { type: getUserOrders.fulfilled.type, payload } as any);
    expect(state.loading).toBe(false);
    expect(state.orders).toEqual(payload);
  });

  it('getOrderByNumber.fulfilled sets selectedOrder', () => {
    const order = makeOrder({ number: 777 });
    let state = reducer(undefined, { type: getOrderByNumber.pending.type } as any);
    state = reducer(state, { type: getOrderByNumber.fulfilled.type, payload: order } as any);
    expect(state.loading).toBe(false);
    expect(state.selectedOrder).toEqual(order);
  });

  it('reducers: clearCurrentOrder and setSelectedOrder work', () => {
    const order = makeOrder();
    let state = reducer(undefined, setSelectedOrder(order));
    expect(state.selectedOrder).toEqual(order);
    state = reducer(state, clearCurrentOrder());
    expect(state.currentOrder).toBeNull();
  });

  it('WS_CONNECTION_SUCCESS toggles ws flags', () => {
    let state = reducer(undefined, {
      type: WS_CONNECTION_SUCCESS,
      payload: { wsType: 'feed' }
    });
    expect(state.feedWsConnected).toBe(true);
    state = reducer(state, {
      type: WS_CONNECTION_SUCCESS,
      payload: { wsType: 'userOrders' }
    });
    expect(state.userOrdersWsConnected).toBe(true);
    expect(state.wsError).toBeNull();
  });

  it('WS_CONNECTION_ERROR sets wsError and resets flag', () => {
    let state = reducer(undefined, {
      type: WS_CONNECTION_ERROR,
      payload: { error: 'ws fail', wsType: 'feed' }
    });
    expect(state.feedWsConnected).toBe(false);
    expect(state.wsError).toBe('ws fail');
  });

  it('WS_CONNECTION_CLOSED resets flags', () => {
    let state = reducer(undefined, {
      type: WS_CONNECTION_SUCCESS,
      payload: { wsType: 'feed' }
    });
    state = reducer(state, { type: WS_CONNECTION_CLOSED, payload: { wsType: 'feed' } });
    expect(state.feedWsConnected).toBe(false);
  });

  it('WS_GET_MESSAGE updates feeds/orders by wsType', () => {
    let state = reducer(undefined, { type: '@@INIT' } as any);
    state = reducer(state, {
      type: WS_GET_MESSAGE,
      payload: {
        wsType: 'feed',
        message: {
          success: true,
          orders: [makeOrder({ _id: 'f1' })],
          total: 5,
          totalToday: 2
        }
      }
    });
    expect(state.feeds).toHaveLength(1);
    expect(state.total).toBe(5);
    expect(state.totalToday).toBe(2);

    state = reducer(state, {
      type: WS_GET_MESSAGE,
      payload: {
        wsType: 'userOrders',
        message: {
          success: true,
          orders: [makeOrder({ _id: 'u2' })]
        }
      }
    });
    expect(state.orders).toHaveLength(1);
  });
});
