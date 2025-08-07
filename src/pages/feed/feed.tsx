import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC, useEffect } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import { getFeeds } from '../../services/slices/ordersSlice';
import {
  startFeedConnection,
  closeFeedConnection
} from '../../services/websocket/socketMiddleware';

export const Feed: FC = () => {
  const {
    feeds: orders,
    loading,
    feedWsConnected
  } = useSelector((state) => state.orders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startFeedConnection());

    if (!feedWsConnected) {
      dispatch(getFeeds());
    }

    return () => {
      dispatch(closeFeedConnection());
    };
  }, [dispatch]);

  const handleGetFeeds = () => {
    if (feedWsConnected) {
      dispatch(startFeedConnection());
    } else {
      dispatch(getFeeds());
    }
  };

  if (loading && orders.length === 0) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
