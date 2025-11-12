import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Route, Routes, Navigate} from "react-router";
import './styles.css';

import Home from "@/routes/home.tsx";
import Profile from "@/routes/profile.tsx";
import Layout from "@/components/sidebar/layout.tsx";
import AddSectionPage from "@/routes/addSection.tsx";
import AddItemPage from "./routes/addItem";
import Login from "@/components/auth/Login";
import { AuthProvider } from "@/contexts/AuthContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página inicial - Login */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* Rotas da aplicação */}
          <Route path="/home" element={<Layout><Home/></Layout>} />
          <Route path="/profile" element={<Layout><Profile/></Layout>} />
          <Route path="/new-section/:id?" element={<Layout><AddSectionPage/></Layout>} />
          <Route path="/new-item/:id?/:section?" element={<Layout><AddItemPage/></Layout>} />
          
          {/* Qualquer outra rota vai para login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
