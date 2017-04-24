module.exports = [
  '[GET] [/api/users/me] [m.noCache & m.session & c.user.me]',
  '[PUT] [/api/users/me] [m.session & c.user.refreshSession]',
  '[POST] [/api/users/like] [level(5) & version([2, 3]) & tracker("user-like", ["code"]) & m.session.login & c.user.like]',
  '[GET] [/api/users/login] [m.session & c.user.loginToken]',
  '[POST] [/api/users/login] [m.session & c.user.login]',
  '[DELETE] [/api/users/logout] [m.session.login & c.user.logout]',
  '[POST] [/api/users/register] [m.session & c.user.register]',
];
