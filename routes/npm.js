module.exports = [
  '[GET] [/api/modules] [c.npm.get]',
  '[PUT] [/api/modules/:name] [m.auth.admin & c.npm.update]',
  '[PUT] [/api/modules/:name/downloads] [m.auth.admin & c.npm.updateDownloads]',
  '[GET] [/api/modules/:name/downloads] [c.npm.getDownloads]',
  '[GET] [/api/modules/count] [c.npm.count]',
];
