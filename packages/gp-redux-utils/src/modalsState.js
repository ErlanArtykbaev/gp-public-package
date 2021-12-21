export const openModalReducer = (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: true } });
export const closeModalReducer = (state, { payload }) => ({ ...state, modalsState: { ...state.modalsState, [payload]: false } });
