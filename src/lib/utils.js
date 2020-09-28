export const getApiHost = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://pocket.clroot.io'
    : 'http://localhost:4000';
};

export const getAppHost = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://pocket.clroot.io'
    : 'http://localhost:3000';
};

export const encodeBase64 = (string) => {
  const buffer = Buffer.from(string);
  return buffer.toString('base64');
};

export const decodeBase64 = (string) => {
  const buffer = Buffer.from(string, 'base64');
  return buffer.toString();
};
