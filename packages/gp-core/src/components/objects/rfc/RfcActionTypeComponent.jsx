import React from 'react';
import { getProcessActionNameType } from '@gostgroup/gp-utils/lib/util.js';

const RfcActionTypeComponent = ({ data }) => <span>{getProcessActionNameType(data)}</span>;

export default RfcActionTypeComponent;
