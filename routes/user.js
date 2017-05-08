module.exports = [
  '[GET] [/api/users/me] [m.noCache & m.session & c.user.me]',
  '[PUT] [/api/users/me] [m.session & c.user.refreshSession]',
  '[POST] [/api/users/behavior] [m.session & c.user.behavior]',
  '[DELETE] [/api/users/logout] [m.session.login & c.user.logout]',
  '[GET] [/api/users/login/callback] [m.session & c.user.loginCallback]',
  '[POST,DELETE] [/api/user/stars/:module] [m.session.login & c.user.star]',
  '[GET] [/api/user/stars] [m.session.login & c.user.getStars]',
];
