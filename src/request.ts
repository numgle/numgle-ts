import https from "https";

export const fetch = <T>(url: string) => {
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
          resolve(<T>JSON.parse(raw));
        });
      }
    );
    request.on("error", (error) => {
      reject(error);
    });
    request.end();
  });
};
