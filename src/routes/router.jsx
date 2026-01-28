import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import IdePage from "../pages/IdePage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/ide/:userName/:projectName",
        element: <IdePage />,
    },
]);

export default router;
