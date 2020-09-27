export const getApiHost = () => {
  return process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_HOST
    : 'http://localhost:4000';
};

export const getAppHost = () => {
  return process.env.NODE_ENV === 'production'
    ? 'https://pocket.clroot.io'
    : 'http://localhost:3000';
};
