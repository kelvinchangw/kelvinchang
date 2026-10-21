import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import ProjectNoir from "./pages/Projects/ProjectNoir/ProjectNoir";
import Blog from "./pages/Blog/Blog";
import Post001 from "./pages/Blog/001/001";
import About from "./pages/About/About";
import NotFound from "./pages/NotFound/NotFound";

// Shell
import Shell from "./components/Shell/Shell";
import TitleManager from "./components/TitleManager";

// Hooks
import useLenis from "./hooks/useLenis";

/**
 * Route table, shared by the app and by tests that render inside a MemoryRouter. Paths match case-sensitively so
 * the router agrees with the shell path and nav resolution in lib/routes.ts (`/Projects` is a 404, like a Unix path).
 */
export function AppRoutes() {
    return (
        <Shell>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} caseSensitive />
                <Route path="/projects" element={<Projects />} caseSensitive />
                <Route path="/projects/project-noir" element={<ProjectNoir />} caseSensitive />
                <Route path="/blog" element={<Blog />} caseSensitive />
                <Route path="/blog/001" element={<Post001 />} caseSensitive />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Shell>
    );
}

function App() {
    useLenis();

    return (
        <BrowserRouter>
            <TitleManager />
            <AppRoutes />
        </BrowserRouter>
    );
}

export default App;
