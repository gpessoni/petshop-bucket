export function Header({ page, onNavigate }) {
  const navClass = (name) => `nav-item ${page.name === name ? "active" : ""}`;
  return (
    <header className="site-header">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); onNavigate({ name: "album" }); }}>
        <span className="brand-mark">🐾</span><span>focinho<span className="brand-highlight"> feliz!</span></span>
      </a>
      <nav className="main-nav" aria-label="Navegação principal">
        <button className={navClass("album")} type="button" onClick={() => onNavigate({ name: "album" })}>Nosso álbum <span className="nav-badge">2025</span></button>
        <button className={navClass("register")} type="button" onClick={() => onNavigate({ name: "register" })}><span className="nav-plus">＋</span> Adicionar pet</button>
      </nav>
      <span className="header-note">feito com <b>♥</b> e muito petisco</span>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <span>focinho feliz! 🐾</span>
      <span>UM ANUÁRIO DE BANHOS, BRINCADEIRAS E MUITO AMOR · 2025</span>
      <span>Patinhas pra cima! <b>♥</b></span>
    </footer>
  );
}

export function NotFound({ onBack }) {
  return (
    <div className="not-found">
      <h1>Ops! Esse focinho saiu para passear.</h1>
      <button className="button button-primary" type="button" onClick={onBack}>Voltar para o álbum</button>
    </div>
  );
}

// Carregando / erro de uma chamada à API.
export function LoadState({ error, onRetry }) {
  if (!error) return <div className="load-state"><span className="load-paw">🐾</span> Buscando os focinhos...</div>;
  return (
    <div className="load-state load-error" role="alert">
      <strong>Não foi possível falar com o servidor.</strong>
      <span>{error.message}</span>
      <button className="button button-light" type="button" onClick={onRetry}>Tentar de novo</button>
    </div>
  );
}
