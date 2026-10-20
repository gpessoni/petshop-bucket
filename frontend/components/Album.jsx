"use client";

import { useState } from "react";
import PetCard from "./PetCard";
import { LoadState } from "./Layout";
import { useLoad } from "../hooks/useLoad";
import { api } from "../lib/api";
import { pad2 } from "../lib/format";
import { SPECIES } from "../lib/pets";

const FILTERS = ["Todos", ...SPECIES];
const KNOWN_SPECIES = SPECIES.filter((species) => species !== "Outro");

function matches(pet, filter, query) {
  const speciesOk = filter === "Todos"
    || (filter === "Outro" ? !KNOWN_SPECIES.includes(pet.species) : pet.species === filter);
  const searchable = `${pet.name} ${pet.species} ${pet.breed} ${pet.owner}`.toLocaleLowerCase("pt-BR");
  return speciesOk && searchable.includes(query.toLocaleLowerCase("pt-BR"));
}

export default function Album({ onOpen, onAdd }) {
  const { data: pets, error, reload } = useLoad(api.listPets, []);
  const [filter, setFilter] = useState("Todos");
  const [query, setQuery] = useState("");
  const shown = (pets || []).filter((pet) => matches(pet, filter, query));

  return (
    <div className="page-wrap">
      <Hero />

      <section className="album-section" id="album">
        <div className="section-heading">
          <div><span className="section-kicker">OLHA QUEM PASSOU POR AQUI!</span><h2>Nossos fofuchos <span>♡</span></h2><p>Uma galeria de focinhos que deixam nosso dia mais feliz.</p></div>
          <div className="count-sticker"><span>{pad2(pets?.length ?? 0)}</span><small>AMIGOS<br />NO ÁLBUM</small></div>
        </div>

        <div className="toolbar">
          <label className="search-box"><span>🔎</span><input type="search" placeholder="Procure pelo nome, raça ou tutor..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Buscar pets" /></label>
          <div className="filter-list" aria-label="Filtrar por espécie">
            {FILTERS.map((item) => <button className={`filter-button ${filter === item ? "active" : ""}`} key={item} type="button" onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>

        {!pets ? <LoadState error={error} onRetry={reload} /> : (
          <div className="pet-grid">
            {shown.length
              ? shown.map((pet, index) => <PetCard key={pet.id} pet={pet} index={index} onOpen={() => onOpen(pet.id)} />)
              : <div className="empty-state"><span>🐶</span><h3>Esse cantinho está vazio!</h3><p>Nenhum focinho encontrado. Que tal tentar outra busca?</p></div>}
            <button className="add-pet-card" type="button" onClick={onAdd}><span className="add-pet-icon">＋</span><strong>Tem mais um<br />focinho por aí?</strong><small>Apresente seu pet à turma!</small><span className="add-pet-link">Adicionar pet <b>→</b></span><span className="add-pet-doodle">✳</span></button>
          </div>
        )}

        <div className="album-note"><span>🫧</span> TODO BANHO TEM UMA HISTÓRIA. TODA HISTÓRIA MERECE UMA FOTO! <span>🫧</span></div>
      </section>
    </div>
  );
}

function Hero() {
  const scrollToAlbum = () => document.querySelector("#album")?.scrollIntoView({ behavior: "smooth" });
  return (
    <section className="hero">
      <div className="hero-confetti confetti-one">✿</div><div className="hero-confetti confetti-two">✦</div>
      <div className="hero-copy">
        <span className="eyebrow"><span className="eyebrow-paw">🐾</span> O ANUÁRIO MAIS FOFINHO DO BAIRRO</span>
        <h1>Um ano de banho,<br /><span>brincadeira</span> e amor!</h1>
        <p>Conheça os astros de quatro patas que passaram por aqui. Cada banho rende uma história — e muitas fotos fofas!</p>
        <button className="button button-dark hero-button" type="button" onClick={scrollToAlbum}>BORA VER AS FOTOS <span>↓</span></button>
        <span className="hero-doodle">au au! <span>〰</span></span>
      </div>
      <div className="hero-collage" aria-label="Fotos fofas de pets">
        <div className="hero-sticker sticker-yellow">TURMA<br />DO BANHO</div>
        <img className="hero-pic hero-pic-main" src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=85" alt="Cachorrinho sorridente" />
        <img className="hero-pic hero-pic-small" src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=85" alt="Gatinho curioso" />
        <span className="hero-sparkle">✳</span><span className="hero-heart">♥</span>
        <div className="sticker-blue">BANHINHO<br />E CARINHO!</div>
      </div>
    </section>
  );
}
