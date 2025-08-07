import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from '../../services/store';
import { useEffect } from 'react';
import { getOrderByNumber } from '../../services/slices/ordersSlice';
import { OrderInfo } from '@components';

export const OrderPage = () => {
  const { number } = useParams();
  const dispatch = useDispatch();
  const { selectedOrder, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    if (number) {
      dispatch(getOrderByNumber(parseInt(number, 10)));
    }
  }, [dispatch, number]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!selectedOrder) {
    return <div>Заказ не найден</div>;
  }

  return (
    <div>
      <h1>Заказ #{selectedOrder.number}</h1>
      <OrderInfo />
    </div>
  );
};
