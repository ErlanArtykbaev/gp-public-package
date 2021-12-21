import { REDUCER_KEY } from './constants';

export default [
  {
    reducer: REDUCER_KEY,
    inboundGetter: state => ({
      selectedLayers: state.selectedLayers,
    }),
    outboundGetter: state => state,
  },
];
