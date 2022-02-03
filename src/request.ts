import https from "https";

type _Response = {
  status: number;
  text: () => Promise<string>;
  json: () => Promise<any>;
};

export const _fetch = (url: string): Promise<_Response> => {
  return new Promise((resolve, reject) => {
    let raw = "";
    const request = https.request(
      {
        hostname: url.split(/\/(.+)/)[0],
        path: url.split(/\/(.+)/)[1],
      } as https.RequestOptions,
      (res) => {
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode!,
            text: () => Promise.resolve(raw),
            json: () => Promise.resolve(JSON.parse(raw)),
          });
        });
      }
    );
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });
};
