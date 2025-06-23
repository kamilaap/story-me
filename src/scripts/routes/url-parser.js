class UrlParser {
  static parseActiveUrlWithCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const [path, queryString] = url.split("?");
    return path || "/";
  }

  static parseActiveUrlWithoutCombiner() {
    const url = window.location.hash.slice(1).toLowerCase();
    const [path, queryString] = url.split("?");
    return this._urlSplitter(path);
  }

  static _urlSplitter(url) {
    const urlsSplits = url.split("/");
    return {
      resource: urlsSplits[1] || null,
      id: urlsSplits[2] || null,
      verb: urlsSplits[3] || null,
    };
  }

  static _urlCombiner(splitedUrl) {
    return (
      (splitedUrl.resource ? `/${splitedUrl.resource}` : "/") +
      (splitedUrl.id ? `/${splitedUrl.id}` : "") +
      (splitedUrl.verb ? `/${splitedUrl.verb}` : "")
    );
  }

  static getQueryParams() {
    const url = window.location.hash.slice(1);
    const [path, queryString] = url.split("?");

    console.log("Full URL:", url);
    console.log("Path:", path);
    console.log("Query String:", queryString);

    if (!queryString) {
      console.warn("No query string found");
      return {};
    }

    const params = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams) {
      params[key] = value;
    }

    console.log("Parsed query params:", params);
    return params;
  }
  static getPathParams() {
    const url = window.location.hash.slice(1);
    const [path] = url.split("?");
    return path.split("/").filter((segment) => segment !== "");
  }

  static getCurrentPath() {
    const url = window.location.hash.slice(1);
    const [path] = url.split("?");
    return path || "/";
  }
}

export default UrlParser;
