import React, { FC } from 'react';
import { OrderStatusProps } from './type';
import { OrderStatusUI } from '@ui';

export const OrderStatus: FC<OrderStatusProps> = ({ status }) => {
  let textStyle = '';
  let text = '';

  switch (status) {
    case 'pending':
      textStyle = '#E52B1A';
      text = 'Готовится';
      break;
    case 'done':
      textStyle = '#00CCCC';
      text = 'Выполнен';
      break;
    case 'created':
      textStyle = '#F2F2F3';
      text = 'Создан';
      break;
    case 'cancelled':
      textStyle = '#E52B1A';
      text = 'Отменён';
      break;
    default:
      textStyle = '#F2F2F3';
      text = 'Неизвестно';
  }

  return <OrderStatusUI textStyle={textStyle} text={text} />;
};
