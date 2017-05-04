import * as globals from '../helpers/globals';

const appUrlPrfix = globals.get('CONFIG.appUrlPrefix');

export const STATS_STATISTICS = `${appUrlPrfix}/api/stats/statistics`;
export const STATS_AJAX = `${appUrlPrfix}/api/stats/ajax`;
export const STATS_EXCEPTION = `${appUrlPrfix}/api/stats/exception`;

export const USER_ME = `${appUrlPrfix}/api/users/me`;
export const USER_LOGIN = `${appUrlPrfix}/api/users/login`;
export const USER_BEHAVIOR = `${appUrlPrfix}/api/users/behavior`;
export const USER_REGISTER = `${appUrlPrfix}/api/users/register`;
export const USER_LOGOUT = `${appUrlPrfix}/api/users/logout`;

export const NPM_COUNT = `${appUrlPrfix}/api/modules/count`;

export const VIEW_HOME = `${appUrlPrfix}/`;
export const VIEW_LOGIN = `${appUrlPrfix}/login`;
export const VIEW_REGISTER = `${appUrlPrfix}/register`;
export const VIEW_SETTING = `${appUrlPrfix}/setting`;
export const VIEW_ACCOUNT = `${appUrlPrfix}/account`;
