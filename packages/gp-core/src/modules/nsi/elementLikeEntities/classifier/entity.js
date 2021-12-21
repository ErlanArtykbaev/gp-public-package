// import { elementLikeRoute } from 'gp-core/lib/routes/objects';
import NewClassifierModal from './NewClassifierModal';
import ClassifierHandler from './ClassifierHandler';

export default {
  type: 'classifier',
  ModalComponent: NewClassifierModal,
  HandlerComponent: ClassifierHandler,
  title: 'классификатор',
  // route: elementLikeRoute('classifier', (nextState, callback) => {
  //   require.ensure([], (require) => {
  //     callback(null, require('./ClassifierHandler').default);
  //   }, 'classifier');
  // }),
};
