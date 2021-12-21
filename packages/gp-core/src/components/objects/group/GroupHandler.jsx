import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { objectSelector } from 'gp-core/lib/redux/selectors/objects';
import Group from './Group';

class GroupHandler extends React.Component {

  static propTypes = {
    path: PropTypes.arrayOf(PropTypes.shape({})),
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { path } = this.props;
    let disabled = false;
    const current = path[path.length - 1];

    if ((current.status && current.status === 'not_available') ||
        (typeof current.isAvailable !== 'undefined' && current.isAvailable === false)) {
      disabled = true;
    }

    const groupProps = {
      item: current,
      disabled,
      path,
    };

    return <Group {...this.props} {...groupProps} />;
  }
}

export default connect(state => ({
  path: objectSelector(state),
}))(GroupHandler);
