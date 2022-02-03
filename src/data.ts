import { _fetch } from "./request";

const dataURL = "raw.githubusercontent.com/numgle/dataset/main/src/data.json";

type Range = {
  start: number;
  end: number;
};
export const isInRange = (num: number, range: Range): boolean =>
  num >= range.start && num <= range.end;
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
export const fetchData = async (): Promise<Data> => {
  return (
    fetch ? await fetch(`https://${dataURL}`) : await _fetch(dataURL)
  ).json();
};
