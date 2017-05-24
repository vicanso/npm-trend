module.exports = [
  '[GET] [/api/modules] [c.npm.get]',
  '[PATCH] [/api/modules/:name] [m.auth.admin & c.npm.update]',
  '[PATCH] [/api/modules/:name/downloads] [m.auth.admin & c.npm.updateDownloads]',
  '[GET] [/api/modules/:name/downloads] [c.npm.getDownloads]',
  '[GET] [/api/modules/count] [c.npm.count]',
  '[PATCH] [/api/modules/:name/period-counts] [m.auth.admin & c.npm.updatePeriodCounts]',
];
