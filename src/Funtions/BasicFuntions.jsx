// Normalizador idéntico a Python
function normalizeText(text, symbols = "-") {
  if (!text) return text;

  // 1️⃣ Eliminar tildes/acentos
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2️⃣ Pasar a minúsculas
  text = text.toLowerCase();

  // 3️⃣ Manejar símbolos con espacios alrededor
  for (const symbol of symbols) {
    const escaped = symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // regex safe
    const regex = new RegExp(`\\s*${escaped}\\s*`, "g");
    text = text.replace(regex, ` ${symbol} `);
  }

  // 4️⃣ Limpiar espacios múltiples
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

export { normalizeText };