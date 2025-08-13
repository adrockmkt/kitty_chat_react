import { useEffect, useState } from "react";

const gifs = [
  "/gatinho/andando_de_costas.gif",
  "/gatinho/andando_de_frente.gif",
  "/gatinho/lambendo_de_frente.gif",
];

export default function GatinhoAnimado({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % gifs.length);
    }, 4000); // troca a cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <img
      src={gifs[index]}
      alt="Gatinho animado"
      className={`w-16 h-16 rounded-md object-cover ml-3 ${className}`}
    />
  );
}