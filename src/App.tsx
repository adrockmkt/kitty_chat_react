import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';

const emojis = [
  { emoji: '😭', tooltip: 'Extremamente insatisfeito' },
  { emoji: '😢', tooltip: 'Muito insatisfeito' },
  { emoji: '😕', tooltip: 'Insatisfeito' },
  { emoji: '😐', tooltip: 'Neutro' },
  { emoji: '🙂', tooltip: 'Satisfeito' },
  { emoji: '😊', tooltip: 'Muito satisfeito' },
  { emoji: '🤩', tooltip: 'Encantado' },
  { emoji: '🔥', tooltip: 'Entusiasmado' }
];

function App() {
  const [currentIndex, setCurrentIndex] = useState(2); // Começa no meio (Neutro)
  const [comment, setComment] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    // Mostra o tooltip por 3 segundos quando muda o emoji
    setShowTooltip(true);
    const timer = setTimeout(() => setShowTooltip(false), 3000);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? emojis.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev === emojis.length - 1 ? 0 : prev + 1);
  };

  const handleSubmit = () => {
    const selectedEmoji = emojis[currentIndex];
    alert(`Feedback enviado!\nEmoção: ${selectedEmoji.emoji} ${selectedEmoji.tooltip}\nComentário: ${comment || 'Nenhum comentário'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black text-white rounded-full mb-4">
            <MessageSquare size={20} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Como foi sua experiência?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Sua opinião é muito importante para nós. Avalie sua experiência e deixe um comentário.
          </p>
        </div>

        {/* Carousel */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevious}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 p-2 flex-shrink-0"
            aria-label="Emoji anterior"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Emoji Display */}
          <div className="relative flex items-center justify-center w-32 h-16">
            {emojis.map((item, index) => {
              const isCenter = index === currentIndex;
              const distance = Math.abs(index - currentIndex);
              
              return (
                <div
                  key={index}
                  className={`
                    absolute transition-all duration-300 flex items-center justify-center
                    ${isCenter ? 'z-10' : 'z-0'}
                  `}
                  style={{
                    transform: `translateX(${(index - currentIndex) * 40}px) scale(${isCenter ? 1.25 : 0.75})`,
                    opacity: distance > 1 ? 0 : isCenter ? 1 : 0.3
                  }}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      transition-all duration-300 border-2
                      ${isCenter 
                        ? 'bg-green-100 border-green-400 shadow-lg shadow-green-200' 
                        : 'border-transparent'
                      }
                    `}
                  >
                    {item.emoji}
                  </div>
                  
                  {/* Tooltip apenas para o emoji central */}
                  {isCenter && showTooltip && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap z-20 animate-in fade-in duration-200">
                      {item.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 p-2 flex-shrink-0"
            aria-label="Próximo emoji"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Comment textarea */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deixe um comentário (opcional)..."
          className="w-full h-24 resize-none border border-gray-200 rounded-xl p-3 text-sm mb-6 font-sans focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-base hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Enviar Feedback
        </button>
      </div>
    </div>
  );
}

export default App;