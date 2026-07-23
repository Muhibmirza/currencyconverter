export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type Conversion = {
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  date: string;
};

export type HistoryEntry = Conversion & {
  timestamp: string;
  historical: boolean;
};

