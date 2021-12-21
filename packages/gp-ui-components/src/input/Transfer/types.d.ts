export interface ListItem {
  title: string;
  id: string | number;
  [key: string]: any;
}

export interface ITransferProps {
  isSourceListLoading?: boolean;
  sourceList: ListItem[];
  sourceListHeaderComponent?: JSX.Element;
  destinationListHeaderComponent?: JSX.Element;
  onChange(value: ListItem[]): void;
  readOnly?: boolean;
  sorted?: boolean;
  selectItemTitleKey?: string;
}

export interface ITransferState {
  sourceList: ListItem[];
  destinationList: ListItem[];
  selectedSourceListIndexes: number[];
  selectedDestinationListIndexes: number[];
}

export type TTransferProps =
  ITransferProps
;

export type TTransferState =
  ITransferState
;
