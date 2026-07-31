/**
 * Standard envelope the backend wraps every response in.
 * The payload itself lives under `dataModel`.
 */
export type ApiEnvelopeDto<TData> = {
  dataModel: TData;
  errorDetails: unknown;
  isError: boolean;
  message: string;
  statusCode: number;
  success: boolean;
};

/** Paged payload shape used inside `dataModel` for list endpoints. */
export type PagedDataDto<TItem> = {
  data: TItem[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
};
