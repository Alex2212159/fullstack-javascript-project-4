const getNameFile = (fullUrl) => {
  const myURL = new URL(fullUrl);
  const partsURL = myURL.hostname + myURL.pathname;
  const re = /[^0-9a-zA-Z]/g;
  const result = partsURL.replace(re, "-") + ".html";
  return result;
};

export default getNameFile;
