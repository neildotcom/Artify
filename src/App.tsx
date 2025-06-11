import "./App.css";
import { CreateListingForm } from "./create-listing-form";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./lib/amplifyClient";

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Create Artwork Listing</h1>
              <p className="text-sm text-gray-600 mt-1">
                Signed in as: <strong>{user?.username}</strong>
              </p>
            </div>
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
          <CreateListingForm />
        </main>
      )}
    </Authenticator>
  );
}

export default App;
