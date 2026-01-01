module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      EXPO_PUBLIC_API_KEY: process.env.EXPO_PUBLIC_API_KEY,
    },
  };
};
