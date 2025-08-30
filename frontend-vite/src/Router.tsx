import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import AIChat from "./components/AIChat";
import GoalWizard from "./components/GoalWizard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/chat",
    element: <AIChat />,
  },
  {
    path: "/new-goal",
    element: <GoalWizard />,
  },
]);

const Router = () => <RouterProvider router={router} />;

export default Router;
