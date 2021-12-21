import { Component, PropTypes } from 'react';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import withMap from './utils/withMap';

export default (update, options = {}) => withMap(class MapLayer extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
  }

  state = { layers: [] }

  shouldComponentUpdate() {
    return false;
  }

  componentWillMount() {
    this.update(this.props);
    // NOTE стоит подумать, будет ли полезно определять поведение клика по создаваемым layers
    // пример:
    // if (options.onClick) {
    //   this.handlers = {
    //     singleclick: this.props.map.on('singleclick', options.onClick),
    //   };
    // }
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(omit(nextProps, 'map'), omit(this.props, 'map'))) {
      this.update(nextProps);
    }
  }

  componentWillUnmount() {
    this.props.map.clearLayers(this.state.layers);
  }

  update(props) {
    const { map } = props;

    const layer = update(props, this.state.layers) || [];
    const layers = Array.isArray(layer) ? layer : [layer];

    map.clearLayers(this.state.layers.filter(l => !layers.includes(l)));
    map.addLayers(layers.filter(l => !this.state.layers.includes(l)));
    this.setState({ layers });
  }

  render() {
    return null;
  }
});
