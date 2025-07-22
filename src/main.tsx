import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter, Route, Routes} from "react-router";
import './styles.css';

import Home from "@/routes/home.tsx";
import Profile from "@/routes/profile.tsx";
import Layout from "@/components/sidebar/layout.tsx";
import AddSectionPage from "@/routes/addSection.tsx";
import AddItemPage from "./routes/addItem";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
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
  </React.StrictMode>,
);
