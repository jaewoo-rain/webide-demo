const config = {
  fastapiUrl: "http://210.117.181.56/fastapi",
  wsUrl: `ws://210.117.181.56/fastapi/ws/terminal`
};

// const config = {
//   fastapiUrl: "/fastapi",
//   wsUrl: `ws://${window.location.host}/fastapi/ws/terminal?pod_name=`
// };

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
