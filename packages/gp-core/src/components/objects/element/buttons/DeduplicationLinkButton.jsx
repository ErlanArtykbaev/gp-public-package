import React from 'react';
import { connect } from 'react-redux';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';

const DeduplicationLinkButton = props => !props.hidden &&
  <AuiButton
    {...props}
    onClick={() => (location.hash = `#/elements/${props.link}`)}
  >
    Результаты дедупликации
  </AuiButton>
;

export default connect(
  (state) => {
    const deduplicationLink = state.core.element.deduplicationLink;
    return {
      hidden: !deduplicationLink || deduplicationLink === '',
      link: deduplicationLink,
    };
  }
)(DeduplicationLinkButton);
