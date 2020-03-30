// inspired by https://stackoverflow.com/questions/3710204/how-to-check-if-a-string-is-a-valid-json-string-in-javascript-without-using-try
const isJson = item => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
};

module.exports = {
  isJson
};
