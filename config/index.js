
import dotenv from 'dotenv';
import path from 'path';

const root = path.normalize(`${__dirname}/../../..`);

const env = dotenv.config({ path: path.join(root, '.env') });

// All configurations will extend these options
// ============================================
const all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',


};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = Object.assign(
  all,
  env);
