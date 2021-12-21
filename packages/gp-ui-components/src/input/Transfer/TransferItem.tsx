import * as React from 'react';
import {
  ListItem,
} from './types.d';

export interface ITransferItemProps {
  index: number;
  data: ListItem;
  titleKey: string;
  onClick(): void;
}

const TransferItem: React.SFC<ITransferItemProps> = ({
  index,
  data,
  onClick,
  titleKey,
}) =>
  <option
    value={data.id}
    onClick={onClick}
  >
    {data[titleKey] || 'Без названия'}
  </option>
;

export default TransferItem;
