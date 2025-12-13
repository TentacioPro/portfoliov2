import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ResumeBuilder from './components/ResumeBuilder';
import ChatInterface from './components/ChatInterface';
import Roadmap from './components/Roadmap';
import Portfolio from './pages/Portfolio';
import Docs from './pages/Docs';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/chat" element={<ChatInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
