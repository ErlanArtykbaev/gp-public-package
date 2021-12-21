import React, { PropTypes, Component } from 'react';
import { autobind } from 'core-decorators';

import keyBy from 'lodash/keyBy';
import { connect } from 'react-redux';
import { getUsers, getProcessesList, getRoles, getOrganizations } from 'gp-core/lib/redux/modules/rfc/config';
import { getLoadingState } from 'gp-core/lib/redux/selectors/rfc/config';
import Preloader from '@gostgroup/gp-ui-components/lib/Preloader';

import ProcessDefinitionModal from './ProcessDefinitionModal';

@autobind
export class BaseProcessDefinitionComponent extends Component {

  static propTypes = {
    processes: PropTypes.arrayOf(PropTypes.shape({})),
    processDefenitionId: PropTypes.string,
    usersMap: PropTypes.shape({}),
    users: PropTypes.arrayOf(PropTypes.shape({})),
    roles: PropTypes.arrayOf(PropTypes.shape({})),
    organizations: PropTypes.arrayOf(PropTypes.shape({})),
    onProcessChange: PropTypes.func,
    getUsers: PropTypes.func,
    getProcessesList: PropTypes.func,
    getRoles: PropTypes.func,
    getOrganizations: PropTypes.func,
    isLoading: PropTypes.bool,
    insertPenultimate: PropTypes.bool,
  };

  constructor() {
    super();

    this.state = {
      processDefinitionModal: null,
      users: [],
      roles: [],
    };
  }

  componentDidMount() {
    this.props.getUsers();
    this.props.getProcessesList();
    this.props.getRoles();
    this.props.getOrganizations();
  }

  showModalCallback() {
    this.setState({
      processDefinitionModal: {
        onAccept: (processDefenitionId, usersMap) => {
          this.props.onProcessChange(processDefenitionId, usersMap);
          this.setState({ processDefinitionModal: null });
        },
        onCancel: () => {
          this.setState({ processDefinitionModal: null });
        },
      },
    });
  }

  render() {
    const { processDefenitionId, processes, usersMap, users, roles,
      organizations, isLoading, insertPenultimate } = this.props;

    const processesMap = keyBy(processes, item => item.id);
    const linkText = processDefenitionId && processesMap[processDefenitionId]
      ? processesMap[processDefenitionId].title
      : 'привязать процесс';

    return (
      <div>
        <button
          type="button"
          className="sh-btn btn btn-default"
          onClick={this.showModalCallback}
          disabled={isLoading}
        >{linkText}</button>
        {isLoading && <Preloader type="field" />}
        <ProcessDefinitionModal
          processes={processesMap}
          users={users}
          roles={roles}
          organizations={organizations}
          isLoading={this.props.isLoading}
          processDefenitionId={processDefenitionId}
          usersMap={usersMap}
          isOpen={!!this.state.processDefinitionModal}
          {...this.state.processDefinitionModal}
          insertPenultimate
        />
      </div>
    );
  }

}

export default connect(
  state => ({
    processes: state.core.rfc.config.processes,
    users: state.core.rfc.config.users,
    roles: state.core.rfc.config.roles,
    organizations: state.core.rfc.config.organizations,
    isLoading: getLoadingState(state, 'getUsers', 'getRoles', 'getOrganizations'),
    isLoadingProcesses: getLoadingState(state, 'getProcessesList'),
  }),
  { getUsers, getProcessesList, getRoles, getOrganizations },
)(BaseProcessDefinitionComponent);
