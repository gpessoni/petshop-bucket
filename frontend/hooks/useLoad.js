"use client";

import { useEffect, useState } from "react";

// Executa uma chamada assíncrona e expõe { data, error, loading, reload }.
// No reload, os dados anteriores continuam na tela até a resposta nova chegar.
export function useLoad(load, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true }));
    load().then(
      (data) => active && setState({ data, error: null, loading: false }),
      (error) => active && setState((current) => ({ ...current, error, loading: false })),
    );
    return () => { active = false; };
  }, [...deps, version]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, reload: () => setVersion((value) => value + 1) };
}
