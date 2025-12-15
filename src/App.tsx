import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import components
import Home from "./pages/Home/Home";
import Projects from "./pages/Projects/Projects";
import Blog from "./pages/Blog/Blog";
import About from "./pages/About/About";

// Import projects
import ProjectNoir from "./pages/Projects/ProjectNoir/ProjectNoir";

// Import blog posts
import Post001 from "./pages/Blog/001/001";

import MenuBar from "./components/MenuBar/MenuBar";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import TitleManager from "./components/TitleManager";

// Import hooks
import useLenis from "./hooks/useLenis";

// Import styles
import "./styles/variables.css";
import "./styles/global.css";

function App() {
    useLenis();

    return (
        <BrowserRouter>
            <TitleManager />

            {/* Keep outside of page for persistent menu bar */}
            <MenuBar />

            <div className="pageContainer">
                <Header />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route
                        path="/projects/project-noir"
                        element={<ProjectNoir />}
                    />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/001" element={<Post001 />} />
                </Routes>

                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;
