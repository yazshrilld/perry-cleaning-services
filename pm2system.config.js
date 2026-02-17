/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable max-len */
// eslint-disable-next-line require-jsdoc
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  // return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  return `${year}-${month}-${day}`;
}

// Generate a timestamp
const timestamp = getTimestamp();

module.exports = {
  apps: [
    {
      name: "localhost_api_development",
      // script: "src/app.ts",
      // interpreter: "babel-node",
      // interpreter_args: "--extensions .ts,.tsx",
      script: "build/app.js", // the path of the script you want to execute
      // eslint-disable-next-line max-len
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      instances: 1, // number of app instance to be launched
      exec_mode: "fork", // mode to start your app, can be “cluster” or “fork”, default fork
      // eslint-disable-next-line max-len
      autorestart: true, // true by default. if false, PM2 will not restart your app if it crashes or ends peacefully
      watch: false, // enable watch & restart feature, if a file change in the folder or subfolder, your app will get reloaded
      error_file: `logs/pm2/${timestamp}-err-app.log`,
      out_file: `logs/pm2/${timestamp}-out-app.log`,
      log_file: `logs/pm2/${timestamp}-combined-app.log`,
      time: true,
      env: {
        NODE_ENV: "staging", // Set the environment to staging
        //  NODE_ENV: "production", // Set the environment to production
      },
    },
   {
      name: "localhost_api_production",
      // script: "src/app.ts",
      // interpreter: "babel-node",
      // interpreter_args: "--extensions .ts,.tsx",
      script: "build/app.js", // the path of the script you want to execute
      // eslint-disable-next-line max-len
      // Options reference: https://pm2.keymetrics.io/docs/usage/application-declaration/
      instances: 1, // number of app instance to be launched
      exec_mode: "fork", // mode to start your app, can be “cluster” or “fork”, default fork
      // eslint-disable-next-line max-len
      autorestart: true, // true by default. if false, PM2 will not restart your app if it crashes or ends peacefully
      watch: false, // enable watch & restart feature, if a file change in the folder or subfolder, your app will get reloaded
      error_file: `logs/pm2/${timestamp}-err-app.log`,
      out_file: `logs/pm2/${timestamp}-out-app.log`,
      log_file: `logs/pm2/${timestamp}-combined-app.log`,
      time: true,
      env: {
        NODE_ENV: "production", // Set the environment to staging
        //  NODE_ENV: "production", // Set the environment to production
      },
    },
  ],
};
