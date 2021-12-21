import { connect } from 'react-redux';

// TODO вынести отдельно, плохо что этот компонент лежит здесь
export default connect(
  state => ({ userPermissions: state.core.session.userPermissions }),
  null, null, { pure: false }
);
