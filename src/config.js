// const config = {
//   fastapiUrl: "fastapi",
//   springUrl: "api",
// };

// export default config;

export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/fastapi": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
};
