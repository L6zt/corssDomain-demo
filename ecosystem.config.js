module.exports = {
  apps: [{
    name: 'www.localhost.com',
    script: './index.js',
    watch: ['server/*.js', 'index.js'],
    logs: true,
    env:{
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
}