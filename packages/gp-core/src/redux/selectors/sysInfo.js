import { createSelector } from 'reselect';

export const sysInfoSelector = createSelector(
  state => state.core.sysInfo,
  ({ sysInfo }) => sysInfo,
);

export const initialSysInfoDataIsLoaded = createSelector(
  state => state.core.sysInfo,
  ({ initialDataIsLoaded }) => initialDataIsLoaded,
);
