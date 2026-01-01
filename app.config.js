require('dotenv').config();

module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
      EXPO_PUBLIC_DOMAIN: process.env.EXPO_PUBLIC_DOMAIN,
    },
  };
};
