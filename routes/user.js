module.exports = [
  '[GET] [/api/users/me] [m.noCache & m.session & c.user.me]',
  '[PUT] [/api/users/me] [m.session & c.user.refreshSession]',
  '[POST] [/api/users/behavior] [m.session & c.user.behavior]',
  '[GET] [/api/users/login] [m.session & c.user.loginToken]',
  '[POST] [/api/users/login] [m.session & c.user.login]',
  '[DELETE] [/api/users/logout] [m.session.login & c.user.logout]',
  '[POST] [/api/users/register] [m.session & c.user.register]',
];
