"use client";

import { useState } from "react";
import Album from "../components/Album";
import PetDetails from "../components/PetDetails";
import PetForm from "../components/PetForm";
import { Footer, Header } from "../components/Layout";
import { PhotoLightbox } from "../components/Photos";

export default function App() {
  const [page, setPage] = useState({ name: "album" });
  const [lightbox, setLightbox] = useState(null);

  function navigate(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const goToAlbum = () => navigate({ name: "album" });
  const openPet = (id) => navigate({ name: "details", id });

  return (
    <div className="app-shell">
      <Header page={page} onNavigate={navigate} />

      <main className="main-content">
        {page.name === "album" && <Album onOpen={openPet} onAdd={() => navigate({ name: "register" })} />}
        {page.name === "register" && <PetForm onCancel={goToAlbum} onSaved={openPet} />}
        {page.name === "details" && <PetDetails petId={page.id} onBack={goToAlbum} onPhoto={setLightbox} />}
      </main>

      <Footer />
      {lightbox && <PhotoLightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}
