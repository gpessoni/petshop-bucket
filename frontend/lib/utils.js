// Lê um campo de texto de um FormData, já sem espaços nas pontas.
export const formText = (form, name) => String(form.get(name) || "").trim();

// Esconde a imagem quando o link estiver quebrado.
export const hideOnError = (event) => {
  event.currentTarget.style.display = "none";
};
