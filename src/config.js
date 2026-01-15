const config = {
  fastapiUrl: "210.117.181.56:30080",
  springUrl: "api",
};

export default config;

// export default {
//   server: {
//     proxy: {
//       "/api": {
//         target: "http://localhost:8080",
//         changeOrigin: true,
//       },
//       "/fastapi": {
//         target: "http://localhost:8000",
//         changeOrigin: true,
//       },
//     },
//   },
// };
