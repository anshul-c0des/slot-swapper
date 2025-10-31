import Navbar from "./components/Navbar";
import AppRouter from "./routes/AppRouter";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const noPaddingRoutes = ["/", "/login", "/signup"];
  const isFullScreen = noPaddingRoutes.includes(location.pathname);
  return (
    <>
      <Navbar />
      <main className={isFullScreen ? "pt-17" : "pt-17 px-10"}>
        <AppRouter />
      </main>
    </>
  );
}
