import http from "http";

import { Data, fetchData } from "./data";

const port = 3000;
let data: Data;

(async () => {
  fetchData().then((json) => {
    data = json as Data;
  });
})();

enum LETTER_TYPE {
  empty = 1,
  completeHangul = 2,
  notCompleteHangul = 3,
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
  else if (
    charCode >= data.range.completeHangul.start &&
    charCode <= data.range.completeHangul.end
  )
    return LETTER_TYPE.completeHangul;
  else if (
    charCode >= data.range.notCompleteHangul.start &&
    charCode <= data.range.notCompleteHangul.end
  )
    return LETTER_TYPE.notCompleteHangul;
  else if (
    charCode >= data.range.uppercase.start &&
    charCode <= data.range.uppercase.end
  )
    return LETTER_TYPE.englishUpper;
  else if (
    charCode >= data.range.lowercase.start &&
    charCode <= data.range.lowercase.end
  )
    return LETTER_TYPE.englishLower;
  else if (
    charCode >= data.range.number.start &&
    charCode <= data.range.number.end
  )
    return LETTER_TYPE.number;
  else if (data.range.special.indexOf(charCode))
    return LETTER_TYPE.specialLetter;
  else return LETTER_TYPE.unknown;
};
const separateHangeul = (chr: number): SeparatedHangeul => {
  return {
    cho: Math.floor((chr - 44032) / 28 / 21),
    jung: Math.floor(((chr - 44032) / 28) % 21),
    jong: Math.floor((chr - 44032) % 28),
  };
};
const isInData = (separated: SeparatedHangeul): boolean => {
  if (separated.jong != 0 && data.jong[separated.jong] == "") return false;
  else if (separated.jung >= 8 && separated.jung != 20)
    return data.jung[separated.jung - 8] != "";
  else return data.cj[Math.min(8, separated.jung)][separated.cho] != "";
};
const combineHangeul = (chr: char): string => {
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
  let start;

  switch (letterType) {
    case LETTER_TYPE.empty:
      return "";

    case LETTER_TYPE.completeHangul:
      return combineHangeul(chr);

    case LETTER_TYPE.notCompleteHangul:
      start = data.range.notCompleteHangul.start;
      return data.han[charCode - start];

    case LETTER_TYPE.englishUpper:
      start = data.range.uppercase.start;
      return data.englishUpper[charCode - start];

    case LETTER_TYPE.englishLower:
      start = data.range.lowercase.start;
      return data.englishLower[charCode - start];

    case LETTER_TYPE.number:
      start = data.range.number.start;
      return data.number[charCode - start];

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
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(text);
    } else {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        "잘못된 요청입니다. 필수 요청 인자가 누락되었습니다. /:넘어뜨릴 문자열"
      );
    }
  })
  .listen(port);
