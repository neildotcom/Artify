import "./app.css"; // Or your styling file
import { CreateListingForm } from "./create-listing-form"; // Adjust path if needed

function App() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Create Artwork Listing</h1>
      <CreateListingForm />
    </main>
  );
}

export default App;