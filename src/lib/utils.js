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
