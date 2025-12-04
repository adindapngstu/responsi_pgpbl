// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get the project root
const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Add a resolver to handle the '@' alias
config.resolver.extraNodeModules = new Proxy(
    {},
    {
        get: (target, name) => path.join(projectRoot, `node_modules/${name}`),
    }
);

module.exports = config;