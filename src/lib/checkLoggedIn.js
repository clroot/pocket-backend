import httpStatus from 'http-status';
const checkLoggedIn = (ctx, next) => {
  if (!ctx.state.auth) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }
  return next();
};

export default checkLoggedIn;
