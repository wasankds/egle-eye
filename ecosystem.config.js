module.exports = {
  apps: [
    {
      name: 'egle-eye-web',
      script: 'egle-eye.js',
      instances: 'max',
      exec_mode: 'cluster'
    },
    {
      name: 'egle-eye-video',
      script: 'myModule/myVideoProcess.js',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}