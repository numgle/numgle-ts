import http from "http";

import { isInRange, Data, fetchData } from "./data";

const port = 3000;
const writeOptions = { "Content-Type": "text/html; charset=utf-8" };

let data: Data;

fetchData().then((json) => {
  data = json;
});

enum LETTER_TYPE {
  empty = 1,
  completeHangeul = 2,
  notCompleteHangeul = 3,
  englishUpper = 4,
  englishLower = 5,
  number = 6,
  specialLetter = 7,
  unknown = 8,
}

type char = string & { length: 1 };
type SeparatedHangeul = {
  cho: number;
  jung: number;
  jong: number;
};

const getLetterType = (charCode: number): LETTER_TYPE => {
  if (isNaN(charCode) || charCode === 13 || charCode === 10 || charCode === 32)
    return LETTER_TYPE.empty;
  else if (isInRange(charCode, data.range.completeHangul))
    return LETTER_TYPE.completeHangeul;
  else if (isInRange(charCode, data.range.notCompleteHangul))
    return LETTER_TYPE.notCompleteHangeul;
  else if (isInRange(charCode, data.range.uppercase))
    return LETTER_TYPE.englishUpper;
  else if (isInRange(charCode, data.range.lowercase))
    return LETTER_TYPE.englishLower;
  else if (isInRange(charCode, data.range.number)) return LETTER_TYPE.number;
  else if (data.range.special.indexOf(charCode))
    return LETTER_TYPE.specialLetter;
  else return LETTER_TYPE.unknown;
};
const separateHangeul = (charCode: number): SeparatedHangeul => {
  return {
    cho: Math.floor((charCode - 44032) / 28 / 21),
    jung: Math.floor(((charCode - 44032) / 28) % 21),
    jong: Math.floor((charCode - 44032) % 28),
  };
};
const isInData = (separated: SeparatedHangeul): boolean => {
  if (separated.jong != 0 && data.jong[separated.jong] == "") return false;
  else if (separated.jung >= 8 && separated.jung != 20)
    return data.jung[separated.jung - 8] != "";
  else return data.cj[Math.min(8, separated.jung)][separated.cho] != "";
};
const completeHangeul = (chr: char): string => {
  const separated = separateHangeul(chr.charCodeAt(0));

  if (!isInData(separated)) return "";

  if (separated.jung >= 8 && separated.jung !== 20)
    return (
      data.jong[separated.jong] +
      data.jung[separated.jung - 8] +
      data.cho[separated.cho]
    );

  return (
    data.jong[separated.jong] +
    data.cj[Math.min(8, separated.jung)][separated.cho]
  );
};
const numglifyChar = (chr: char): string => {
  const charCode = chr.charCodeAt(0);
  const letterType = getLetterType(charCode);

  switch (letterType) {
    case LETTER_TYPE.empty:
      return "";

    case LETTER_TYPE.completeHangeul:
      return completeHangeul(chr);

    case LETTER_TYPE.notCompleteHangeul:
      return data.han[charCode - data.range.notCompleteHangul.start];

    case LETTER_TYPE.englishUpper:
      return data.englishUpper[charCode - data.range.uppercase.start];

    case LETTER_TYPE.englishLower:
      return data.englishLower[charCode - data.range.lowercase.start];

    case LETTER_TYPE.number:
      return data.number[charCode - data.range.number.start];

    case LETTER_TYPE.specialLetter:
      return data.special[data.range.special.indexOf(charCode)];

    case LETTER_TYPE.unknown:
      return "";
  }
};
const numglifyString = (text: string): string => {
  let numgle = "";

  for (let i = 0; i < text.length; i++)
    numgle += numglifyChar(<char>text[i]) + "<br>";

  return numgle;
};

http
  .createServer((req, res) => {
    const text: string = numglifyString(
      decodeURIComponent(req.url || "").split("/")[1] || ""
    );

    if (text) {
      res.writeHead(200, writeOptions);
      res.end(text);
    } else {
      res.writeHead(400, writeOptions);
      res.end(
        "????????? ???????????????. ?????? ?????? ????????? ?????????????????????. /:???????????? ?????????"
      );
    }
  })
  .listen(port);
