import { useState, useEffect } from 'react';
import { submitFeedback } from '../services/feedbackService';

const compactEmojis = [
  { emoji: '😭', tooltip: 'Muito ruim' },
  { emoji: '😕', tooltip: 'Ruim' },
  { emoji: '😐', tooltip: 'Ok' },
  { emoji: '😊', tooltip: 'Bom' },
  { emoji: '🤩', tooltip: 'Excelente' }
];

interface CompactFeedbackProps {
  postId?: string;
  onFeedbackSent?: (feedback: any) => void;
}

export default function CompactFeedback({ postId, onFeedbackSent }: CompactFeedbackProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmojiClick = async (index: number) => {
    if (isSubmitting) return;
    
    setSelectedEmoji(index);
    setIsSubmitting(true);

    try {
      const feedback = {
        emoji: compactEmojis[index].emoji,
        emotion: compactEmojis[index].tooltip,
        comment: postId ? `Post: ${postId}` : '',
        post_id: postId
      };

      await submitFeedback(feedback);
      setMessage('✅ Obrigado pelo feedback!');
      onFeedbackSent?.(feedback);
      
      setTimeout(() => {
        setMessage('');
        setSelectedEmoji(null);
      }, 3000);
    } catch (error) {
      setMessage('❌ Erro ao enviar feedback');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-3">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Como você avalia este conteúdo?
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-3">
        {compactEmojis.map((item, index) => (
          <button
            key={index}
            onClick={() => handleEmojiClick(index)}
            disabled={isSubmitting}
            className={`
              relative w-10 h-10 rounded-full text-xl transition-all duration-200
              hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700
              ${selectedEmoji === index ? 'bg-green-100 dark:bg-green-900 scale-110' : ''}
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={item.tooltip}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {message && (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}