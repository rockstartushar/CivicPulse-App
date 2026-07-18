const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Monorepo: also watch the mobile workspace sources re-exported by root app routes.
config.watchFolders = [path.join(projectRoot, 'apps/mobile')];

module.exports = config;
