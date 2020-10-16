export const getApiHost = () =>
  process.env.NODE_ENV === 'production'
    ? 'https://pocket.clroot.io'
    : 'http://localhost:4000';

export const getAppHost = () =>
  process.env.NODE_ENV === 'production'
    ? 'https://pocket.clroot.io'
    : 'http://localhost:3000';

export const encodeBase64 = (target: string) => {
  const buffer = Buffer.from(target);
  return buffer.toString('base64');
};

export const decodeBase64 = (target: string) => {
  const buffer = Buffer.from(target, 'base64');
  return buffer.toString();
};
