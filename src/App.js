import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Callback from './components/Callback';
import KakaoCallback from "./components/KakaoCallback";
import AppleCallback from './components/AppleCallback';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="/kakao/callback" element={<KakaoCallback />} />
        <Route path="/apple/callback" element={<AppleCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
