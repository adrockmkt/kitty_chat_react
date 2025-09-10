import { useState, useEffect } from 'react';
import GatinhoAnimado from './components/GatinhoAnimado.tsx';
import FeedbackStats from './components/FeedbackStats';
import CompactFeedback from './components/CompactFeedback';
import InterfaceSelector from './components/InterfaceSelector';
import { ChevronLeft, ChevronRight, MessageSquare, Sun, Moon } from 'lucide-react';
import { submitFeedback } from './services/feedbackService';
import { useTheme } from './hooks/useTheme';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isCompact, setIsCompact] = useState(false);
  const { isDark, toggleTheme } = useTheme();

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

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setMessage('');

    try {
    const selectedEmoji = emojis[currentIndex];
      
      await submitFeedback({
        emoji: selectedEmoji.emoji,
        emotion: selectedEmoji.tooltip,
        comment: comment.trim() || null
      });

      setMessage('✅ Feedback enviado com sucesso! Obrigado pela sua avaliação.');
      setComment('');
      
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage('❌ Erro ao enviar feedback. Tente novamente.');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <InterfaceSelector isCompact={isCompact} onToggle={setIsCompact} />
        
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-sm">
            <CompactFeedback />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      <InterfaceSelector isCompact={isCompact} onToggle={setIsCompact} />
      
      {/* Botão de tema */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Painel de estatísticas */}
      <div className="hidden lg:block w-80 p-6 pt-48">
        <FeedbackStats />
      </div>

      {/* Interface principal */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-8 text-center transition-colors duration-300">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full mb-4 transition-colors duration-300">
            <MessageSquare size={20} />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">
            Como foi sua experiência?
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
            Sua opinião é muito importante para nós. Avalie sua experiência e deixe um comentário.
          </p>
        </div>

        {/* Carousel */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <button
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 flex-shrink-0 disabled:opacity-50"
            aria-label="Emoji anterior"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Emoji Display */}
          <div className="relative flex items-center justify-center w-64 h-16">
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
                    transform: `translateX(${(index - currentIndex) * 48}px) scale(${isCenter ? 1.25 : 0.8})`,
                    opacity: distance > 2 ? 0 : isCenter ? 1 : 0.4
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
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs px-3 py-1 rounded-lg whitespace-nowrap z-20 animate-in fade-in duration-200 transition-colors duration-300">
                      {item.tooltip}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-200"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 p-2 flex-shrink-0 disabled:opacity-50"
            aria-label="Próximo emoji"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Mensagem de feedback */}
        {message && (
          <div className="mb-6 p-3 rounded-lg bg-gray-100 dark:bg-gray-700 transition-colors duration-300">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {message}
            </p>
          </div>
        )}

        {/* Comment textarea com GatinhoAnimado */}
        <div className="flex items-start mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
            placeholder="Deixe um comentário (opcional)..."
            className="flex-1 w-full h-24 resize-none border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-300 disabled:opacity-50"
          />
          <div>
            <GatinhoAnimado className="w-[50px] h-[80px] pt-2" />
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-base hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Enviando...' : 'Enviar feedback'}
        </button>
        </div>
      </div>
    </div>
  );
}

export default App;