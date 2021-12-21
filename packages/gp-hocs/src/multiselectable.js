import get from 'lodash/get';
import { withState, compose, withHandlers } from 'recompose';
import { remove } from '@gostgroup/gp-utils/lib/immutable/array';

export default compose(
  withState('selected', 'setSelected', []),
  withHandlers({
    clearSelected: ({ setSelected }) => () => setSelected([]),
    toggleSelect: ({ setSelected, selected }) => id =>
      selected.includes(id)
      ? setSelected(remove(selected, selected.indexOf(id)))
      : setSelected([...selected, id]),
    setQuery: ({ handleQueryChange }) => e => handleQueryChange(get(e, 'target.value', e)),
  }),
);
