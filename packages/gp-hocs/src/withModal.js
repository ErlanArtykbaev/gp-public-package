import { withProps, compose, withState } from 'recompose';

const withModal = compose(
  withState('modalIsOpen', 'setModalIsOpen', false),
  withProps(({ setModalIsOpen, modalIsOpen }) => ({
    openModal: () => setModalIsOpen(true),
    closeModal: () => setModalIsOpen(false),
    toggleModal: () => setModalIsOpen(!modalIsOpen),
  })),
);

export default withModal;
