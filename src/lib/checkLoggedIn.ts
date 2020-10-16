import httpStatus from 'http-status';
import { Context } from 'koa';

const checkLoggedIn = (ctx: Context, next: Function) => {
  if (!ctx.state.auth) {
    ctx.status = httpStatus.UNAUTHORIZED;
    return;
  }
  return next();
};

export default checkLoggedIn;
