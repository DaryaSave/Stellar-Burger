import { ProfileOrdersUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { getUserOrders } from '../../services/slices/ordersSlice';
import {
  startUserOrdersConnection,
  closeUserOrdersConnection
} from '../../services/websocket/socketMiddleware';

export const ProfileOrders: FC = () => {
  const { orders, userOrdersWsConnected } = useSelector(
    (state) => state.orders
  );
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(startUserOrdersConnection());

      if (!userOrdersWsConnected) {
        dispatch(getUserOrders());
      }
    }

    return () => {
      dispatch(closeUserOrdersConnection());
    };
  }, [dispatch, isAuthenticated]);

  return <ProfileOrdersUI orders={orders} />;
};
