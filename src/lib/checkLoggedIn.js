const checkLoggedIn = (ctx, next) => {
  if (!ctx.state.auth) {
    ctx.status = 401;
    return;
  }
  return next();
};

export default checkLoggedIn;
