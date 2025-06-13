import "./App.css";
import { CreateListingForm } from "./create-listing-form";
import { Authenticator } from "@aws-amplify/ui-react";
import { ListingsPage } from "./listings-page.tsx"; 
import { MyListingsPage } from "./my-listings-page.tsx"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "@aws-amplify/ui-react/styles.css";
import "./lib/amplifyClient";
import "./index.css";

function App() {
  return (
    <Router>
      <Authenticator>
        {({ signOut, user }) => (
          <>
            {/* Top Nav */}
            <header className="w-full border-b bg-white shadow-sm px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-bold text-primary">Artify</h1>
                <nav className="hidden md:flex gap-4 text-sm text-muted-foreground">
                  <a href="/" className="hover:text-primary">Home</a>
                  <a href="/listings" className="hover:text-primary">Browse</a>
                  <a href="/my-listings" className="hover:text-primary">Selling</a>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Hi, {user?.username}</span>
                <button
                  onClick={signOut}
                  className="bg-gray-100 border px-3 py-1 rounded text-sm hover:bg-gray-200"
                >
                  Sign Out
                </button>
              </div>
            </header>

            {/* Page Content */}
            <main className="px-6 py-10">
              <Routes>
                <Route path="/" element={<CreateListingForm />} />
                <Route path="/listings" element={<ListingsPage />} />
                <Route path="/my-listings" element={<MyListingsPage />} /> 
              </Routes>
            </main>
          </>
        )}
      </Authenticator>
    </Router>
  );
}


export default App;
