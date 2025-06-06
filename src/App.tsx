import "./app.css";
import { CreateListingForm } from "./create-listing-form";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import "./lib/amplifyClient"; // Make sure this exists and points to your amplify_outputs config

function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Create Artwork Listing</h1>
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
