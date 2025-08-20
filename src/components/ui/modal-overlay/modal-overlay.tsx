import styles from './modal-overlay.module.css';

type Props = {
  onClick: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const ModalOverlayUI = ({ onClick, ...rest }: Props) => (
  <div className={styles.overlay} onClick={onClick} {...rest} />
);
