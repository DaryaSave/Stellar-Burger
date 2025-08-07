import { FC, memo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';

import { TModalProps } from './type';
import { ModalUI } from '@ui';

const modalRoot = document.getElementById('modals');

export const Modal: FC<TModalProps> = memo(({ title, children, onClose }) => {
  const navigate = useNavigate();

  const handleClose = onClose || (() => navigate(-1));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      e.key === 'Escape' && handleClose();
    };

    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [handleClose]);

  return ReactDOM.createPortal(
    <ModalUI title={title} onClose={handleClose}>
      {children}
    </ModalUI>,
    modalRoot as HTMLDivElement
  );
});
