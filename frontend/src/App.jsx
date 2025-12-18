import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ShareHolderCompanies from "./pages/ShareHolderCompanies";
import CreateCompany from "./pages/CreateCompany";
import CreateShares from "./pages/CreateShares";
import DirectCreateShares from "./pages/DirectCreateShares";
import CheckShares from "./pages/CheckShares";
import SharesOwned from "./pages/Sharesowned";
import ShareTransfer from "./pages/ShareTransfer";
import ShareholderTaxDue from "./pages/ShareHolderTaxDue";
import DeployContract from "./pages/DeployContract";
import MintShares from "./pages/MintShares";
import BlockchainTransfer from "./pages/BlockChainTransfer";
import CompanyLedger from "./pages/CompanyShareLedger";
import AuthorityTransfers from "./pages/AuthorityView";
import AuthorityCompanies from "./pages/AuthorityCompanies";
import NotFound from "./pages/NotFound";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";

/* 
  LogoutAndRegister function -> deleting localstorage
*/
function LogoutAndRegister() {
  //clearing localstorage -> tokens related to previous authentications should be cleared so user can register
  //user needs new tokens
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shareholdercos"
          element={
            <ProtectedRoute>
              <ShareHolderCompanies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createco"
          element={
            <ProtectedRoute>
              <CreateCompany />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shareholdertaxdue"
          element={
            <ProtectedRoute>
              <ShareholderTaxDue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sharesowned"
          element={
            <ProtectedRoute>
              <SharesOwned />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/:company_id/ledger"
          element={
            <ProtectedRoute>
              <CompanyLedger />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createshares/:company_id"
          element={
            <ProtectedRoute>
              <CreateShares />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mintshares/:company_id"
          element={
            <ProtectedRoute>
              <MintShares />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blockchain-transfer/:transfer_id"
          element={
            <ProtectedRoute>
              <BlockchainTransfer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkshares/:company_id"
          element={
            <ProtectedRoute>
              <CheckShares />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sharetransfer/:share"
          element={
            <ProtectedRoute>
              <ShareTransfer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deploy-contract/:company_id"
          element={
            <ProtectedRoute>
              <DeployContract />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authorityview"
          element={
            <ProtectedRoute>
              <AuthorityTransfers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/authoritycompanies"
          element={
            <ProtectedRoute>
              <AuthorityCompanies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login"
          element={
            //No need for protected route anyone can navigate to Login
            <Login />
          }
        />

        <Route
          path="/register"
          element={
            //No need for protected route anyone can navigate to Logout and Register
            <LogoutAndRegister />
          }
        />

        <Route
          path="/logout"
          element={
            //No need for protected route anyone can navigate to do plain Logout
            <Logout />
          }
        />

        <Route
          path="*" //any other path -> NotFound
          element={
            //No need for protected route not specified routes will just render a NotFound
            <NotFound />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
