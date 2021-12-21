import React from 'react';
import togglable from '@gostgroup/gp-hocs/lib/togglable';
import HistoryModal from './HistoryModal';

const Modals = (props) => {
  const { toggleOpen, children, isOpen, data } = props;
  return (
    <a onClick={toggleOpen}>
      {children}
      <HistoryModal data={data} isOpen={isOpen} onClose={toggleOpen} />
    </a>
  );
};

Modals.propTypes = {
  data: React.PropTypes.object,
  children: React.PropTypes.any,
  toggleOpen: React.PropTypes.func,
  isOpen: React.PropTypes.bool,
};

export default togglable('isOpen', 'toggleOpen', p => p.isOpen)(Modals);
