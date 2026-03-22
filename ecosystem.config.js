module.exports = {
  apps: [{
    name: 'startivo',
    script: './server/index.js',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
