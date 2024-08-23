import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Callback from './components/Callback';
import KakaoCallback from "./components/KakaoCallback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/kakao/callback" element={<KakaoCallback />} /> {/* Kakao 콜백 경로 추가 */}
      </Routes>
    </Router>
  );
}

export default App;
