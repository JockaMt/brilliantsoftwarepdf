import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import './styles.css';
import { Toaster } from 'sonner';

import Home from "@/routes/home.tsx";
import Profile from "@/routes/profile.tsx";
import Layout from "@/components/sidebar/layout.tsx";
import AddSectionPage from "@/routes/addSection.tsx";
import AddItemPage from "./routes/addItem";
import { LicenseGuard } from "@/components/license";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LicenseGuard>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path={"/"} element={<Home/>}/>
            <Route path={"/profile"} element={<Profile/>}/>
            <Route path={"/new-section/:id?"} element={<AddSectionPage/>}/>
            <Route path={"/new-item/:id?/:section?"} element={<AddItemPage/>}/>
          </Routes>
        </Layout>
      </BrowserRouter>
    </LicenseGuard>
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          color: '#374151',
        },
        className: 'custom-toast',
        duration: 4000,
      }}
    />
  </React.StrictMode>,
);
