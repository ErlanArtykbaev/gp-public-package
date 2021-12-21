import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

export const enhanceWithPermissions = ({
  pathToPermissions = 'core.session.userPermissions',
} = {}) => (ComposedComponent) => {
  class HOC extends Component {

    static propTypes = {
      userPermissions: PropTypes.array.isRequired,
      permissions: PropTypes.array,
      oneOfPermissions: PropTypes.array,
    }

    static defaultProps = {
      userPermissions: [],
      permissions: [],
      oneOfPermissions: [],
    }

    /**
     * Определяет, доступен ли компонент для отображения пользователю в зависимости от требуемых прав
     * @return {boolean} isPermitted - доступен ли компонент для отображения
     */
    isPermitted() {
      const { userPermissions = [], permissions = [], oneOfPermissions = [] } = this.props;
      // В случае если достаточно наличия хоть одного доступа
      if (oneOfPermissions.length) {
        return userPermissions.filter(up => oneOfPermissions.indexOf(up) + 1).length;
      }

      // В случае если требуемые права не указаны
      if (permissions.length === 0) {
        return true;
      }

      return permissions.filter(p => userPermissions.indexOf(p) + 1).length;
    }

    /**
     * React render
     * проводит проверку на наличие прав у пользователя, в случае отсутствия - не отображает компонент
     * @return {?React.Component}
     */
    render() {
      if (!this.isPermitted()) {
        return null;
      }
      return <ComposedComponent {...this.props} />;
    }
  }

  return connect(
    state => ({
      userPermissions: get(state, pathToPermissions, []),
    }),
    null,
    null,
    { pure: false },
  )(HOC);
};

export default enhanceWithPermissions({ pathToPermissions: 'core.session.userPermissions' });
