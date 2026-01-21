const config = {
  fastapiUrl: "http://210.117.181.56:32460/fastapi",
  wsUrl: `ws://210.117.181.56:32460/fastapi/ws/terminal?pod_name=`
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
