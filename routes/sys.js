module.exports = [
  ['GET', '/api/sys/level', '[m.noCache & c.system.level]'],
  ['POST', '/api/sys/level', '[m.auth.admin & c.system.setLevel]'],
  ['POST', '/api/sys/exit', '[m.auth.admin & c.system.exit]'],
  ['POST', '/api/sys/pause', '[m.auth.admin & c.system.pause]'],
  ['POST', '/api/sys/resume', '[m.auth.admin & c.system.resume]'],
  ['GET', '/api/sys/status', '[m.noQuery & c.system.status]'],
  ['GET', '/api/sys/version', '[m.noQuery & c.system.version]'],
];
