import get from 'lodash/get';
import { withState, compose, withHandlers } from 'recompose';

export default compose(
  withState('query', 'handleQueryChange', ''),
  withHandlers({
    setQuery: ({ handleQueryChange }) => e => handleQueryChange(get(e, 'target.value', e)),
  }),
);
