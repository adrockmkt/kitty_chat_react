import { useState, useEffect } from 'react';
import { Copy, Code } from 'lucide-react';
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
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const generateEmbedCode = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return `<!-- Kitty Chat Feedback Widget -->
<div id="kitty-feedback-widget"></div>
<script>
(function() {
  // CSS Styles
  const styles = \`
    .kitty-feedback {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      margin: 20px auto;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-feedback {
        background: #1f2937;
        border-color: #374151;
        color: white;
      }
      .kitty-feedback p {
        color: #d1d5db;
      }
      .kitty-feedback button:hover {
        background: #374151 !important;
      }
    }
    .kitty-feedback p {
      text-align: center;
      margin-bottom: 12px;
      font-size: 14px;
      color: #6b7280;
    }
    .kitty-feedback-emojis {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .kitty-feedback-emoji {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      font-size: 18px;
      border: none;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kitty-feedback-emoji:hover {
      transform: scale(1.1);
      background: #f3f4f6;
    }
    .kitty-feedback-emoji.selected {
      background: #dcfce7;
      transform: scale(1.1);
    }
    .kitty-feedback-message {
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  \`;
  
  // Add styles to page
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
  
  // Emojis data
  const emojis = [
    { emoji: '😭', tooltip: 'Muito ruim' },
    { emoji: '😕', tooltip: 'Ruim' },
    { emoji: '😐', tooltip: 'Ok' },
    { emoji: '😊', tooltip: 'Bom' },
    { emoji: '🤩', tooltip: 'Excelente' }
  ];
  
  // Create widget HTML
  const widget = document.getElementById('kitty-feedback-widget');
  widget.innerHTML = \`
    <div class="kitty-feedback">
      <p>Como você avalia este conteúdo?</p>
      <div class="kitty-feedback-emojis">
        \${emojis.map((item, index) => 
          \`<button class="kitty-feedback-emoji" data-index="\${index}" title="\${item.tooltip}">
            \${item.emoji}
          </button>\`
        ).join('')}
      </div>
      <div class="kitty-feedback-message" id="feedback-message"></div>
    </div>
  \`;
  
  // Add click handlers
  const emojiButtons = widget.querySelectorAll('.kitty-feedback-emoji');
  const messageDiv = widget.querySelector('#feedback-message');
  
  emojiButtons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      // Visual feedback
      emojiButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      
      // Disable buttons during submission
      emojiButtons.forEach(btn => btn.disabled = true);
      messageDiv.textContent = 'Enviando...';
      
      try {
        // Submit to Supabase
        const response = await fetch('${supabaseUrl}/rest/v1/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': '${supabaseKey}',
            'Authorization': 'Bearer ${supabaseKey}',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            emoji: emojis[index].emoji,
            emotion: emojis[index].tooltip,
            comment: 'Feedback do blog: ' + window.location.href,
            post_id: window.location.pathname,
            created_at: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          messageDiv.textContent = '✅ Obrigado pelo feedback!';
          setTimeout(() => {
            messageDiv.textContent = '';
            emojiButtons.forEach(btn => {
              btn.disabled = false;
              btn.classList.remove('selected');
            });
          }, 3000);
        } else {
          throw new Error('Erro na resposta');
        }
      } catch (error) {
        messageDiv.textContent = '❌ Erro ao enviar feedback';
        setTimeout(() => {
          messageDiv.textContent = '';
          emojiButtons.forEach(btn => btn.disabled = false);
        }, 3000);
      }
    });
  });
})();
</script>
<!-- Fim do Kitty Chat Feedback Widget -->`;
  };

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

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
      {/* Botão de Embed */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
        >
          <Code size={12} />
          Embed
        </button>
      </div>

      {/* Modal de Embed */}
      {showEmbed && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Código para seu blog
            </h4>
            <button
              onClick={() => setShowEmbed(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            Cole este código no seu blog. Funciona com tema automático e mantém conexão com o banco de dados.
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyEmbedCode}
              className={`flex-1 px-3 py-2 text-xs rounded flex items-center justify-center gap-1 transition-colors ${
                embedCopied 
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
              }`}
            >
              <Copy size={12} />
              {embedCopied ? 'Copiado!' : 'Copiar código'}
            </button>
          </div>
        </div>
      )}

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