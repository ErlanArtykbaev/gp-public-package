import { handleActions } from 'redux-actions';
import cloneDeep from 'lodash/cloneDeep';
import deduplicationRules from 'gp-core/lib/constants/deduplicationRules';

const initialState = cloneDeep(deduplicationRules);

export default handleActions({}, initialState);
