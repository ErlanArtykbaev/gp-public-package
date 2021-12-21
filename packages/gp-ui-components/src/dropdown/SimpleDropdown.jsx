import React, { PropTypes } from 'react';
import flatten from 'lodash/flatten';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';

export default class SimpleDropdown extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    children: PropTypes.node,
  }

  static defaultProps = {
    className: 'sh-btn',
    title: '',
    id: 'simple-dropdown',
  }

  render() {
    const { children, className = '', title, id } = this.props;

    return (
      <DropdownButton
        id={id}
        pullRight
        title={title}
        className={className}
      >
        {flatten(children || []).map((c, i) => <MenuItem key={i}>{c}</MenuItem>)}
      </DropdownButton>
    );
  }
}
