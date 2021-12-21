import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { persistStore, createTransform as reduxPersistCreateTransform } from 'redux-persist';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

function createTransform({ reducer, inboundGetter, outboundGetter }) {
  return reduxPersistCreateTransform(
    state => inboundGetter(state),
    state => outboundGetter(state),
    { whitelist: [reducer] },
  );
}

export default class AppProvider extends Component {
  static propTypes = {
    store: PropTypes.shape({
      getState: PropTypes.func,
    }).isRequired,
    children: PropTypes.node,
    transforms: PropTypes.arrayOf(PropTypes.shape({
      reducer: PropTypes.string.isRequired,
      inboundGetter: PropTypes.func.isRequired,
      outboundGetter: PropTypes.func.isRequired,
    })),
  }

  constructor(props) {
    super(props);

    this.state = { rehydrated: false };
  }

  componentWillMount() {
    const { store, transforms = [] } = this.props;

    const coreTransformObject = {
      reducer: 'core',
      inboundGetter: state => ({
        element: pick(state.element, ['config']),
        objects: pick(state.objects, ['favourites']),
        session: omit(state.session, ['isLoading']),
      }),
      outboundGetter: state => state,
    };

    const transformObjects = [coreTransformObject, ...transforms];
    const whitelist = transformObjects.map(o => o.reducer);
    const finalTransforms = transformObjects.map(o => createTransform(o));

    const opts = {
      whitelist,
      transforms: finalTransforms,
      keyPrefix: 'nsi:',
    };

    persistStore(store, opts, () => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return null;
    }
    return (
      <Provider store={this.props.store}>
        {this.props.children}
      </Provider>
    );
  }
}
