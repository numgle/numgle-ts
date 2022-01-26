import { fetch } from "./request";

export type Range = {
  start: number;
  end: number;
};
export type Data = {
  cho: string[];
  jong: string[];
  jung: string[];
  cj: string[][];
  han: string[];
  englishUpper: string[];
  englishLower: string[];
  number: string[];
  special: string[];
  range: {
    completeHangul: Range;
    notCompleteHangul: Range;
    uppercase: Range;
    lowercase: Range;
    number: Range;
    special: number[];
  };
};
export const fetchData = () => {
  return fetch<Data>(
    "raw.githubusercontent.com/numgle/dataset/main/src/data.json"
  );
};
