import React, { Component } from 'react';
import { getProcessActionNameTypeWithObjectTitle } from '@gostgroup/gp-utils/lib/util.js';

const RfcActionNameComponent = ({ rowData }) =>
  <span>{getProcessActionNameTypeWithObjectTitle(rowData)}</span>
;

export default RfcActionNameComponent;
