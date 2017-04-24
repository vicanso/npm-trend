const npmService = localRequire('services/npm');
exports.update = async (ctx) => {
  await npmService.update(ctx.params.name);
  ctx.body = null;
};
