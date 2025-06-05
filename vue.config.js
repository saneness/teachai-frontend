const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true, // Оставьте это, если оно у вас было
  devServer: {
    proxy: {
      // Все запросы, начинающиеся с /api, будут перенаправлены
      '/api': {
        target: 'http://localhost:5000', // Укажите здесь URL вашего Flask бэкенда
        ws: true, // Если вы планируете использовать WebSockets через этот прокси
        changeOrigin: true, // Необходимо для виртуальных хостов и обхода некоторых проблем с CORS
        // pathRewrite не нужен, так как ваш Flask API ожидает префикс /api
        // (т.к. bp = Blueprint('api', __name__, url_prefix='/api'))
        // Если бы Flask API не имел префикса /api, нужно было бы pathRewrite: { '^/api': '' }
      },
      // Вы можете добавить другие правила прокси, если необходимо
      // '/another-api': {
      //   target: 'http://another-backend.com',
      //   changeOrigin: true,
      //   pathRewrite: { '^/another-api': '' },
      // }
    },
  },
});
