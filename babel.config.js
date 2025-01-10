module.exports = {
  presets: [
    '@babel/preset-env',
  ],
  plugins: [
    [
      'babel-plugin-transform-define',
      {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false, // Define the feature flag here
      },
    ],
  ],
};