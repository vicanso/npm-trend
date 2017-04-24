import * as globals from '../helpers/globals';

const appUrlPrfix = globals.get('CONFIG.appUrlPrefix');

export const STATS_STATISTICS = '/api/stats/statistics';
export const STATS_AJAX = '/api/stats/ajax';
export const STATS_EXCEPTION = '/api/stats/exception';

export const USER_ME = '/api/users/me';
export const USER_LOGIN = '/api/users/login';
export const USER_LIKE = '/api/users/like';
export const USER_REGISTER = '/api/users/register';
export const USER_LOGOUT = '/api/users/logout';

export const VIEW_HOME = `${appUrlPrfix}/`;
export const VIEW_LOGIN = `${appUrlPrfix}/login`;
export const VIEW_REGISTER = `${appUrlPrfix}/register`;
export const VIEW_SETTING = `${appUrlPrfix}/setting`;
export const VIEW_ACCOUNT = `${appUrlPrfix}/account`;
