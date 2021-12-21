import React from 'react';
import { connect } from 'react-redux';
import { openElementSettingsModal } from 'gp-core/lib/redux/modules/element';
import AuiButton from '@gostgroup/gp-ui-components/lib/buttons/AuiButton';
import SettingGridModal from '../SettingGridModal';

const SettingsButton = props => (
  <AuiButton
    title="Настройка отображения справочника"
    {...props}
  >
    <i className="fa fa-cog" aria-hidden="true" />
    <SettingGridModal />
  </AuiButton>
);

export default connect(
  null,
  { onClick: openElementSettingsModal }
)(SettingsButton);
