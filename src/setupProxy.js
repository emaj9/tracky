const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/db',
    createProxyMiddleware({
      target: 'http://localhost:5984',
      pathRewrite: {
        '^/db/': '/',
      },
      changeOrigin: true,
    }),
  );
};
