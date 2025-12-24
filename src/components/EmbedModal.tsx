import { useState } from 'react';
import { Copy, X } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'compact' | 'full';
}

export default function EmbedModal({ isOpen, onClose, mode }: EmbedModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCompactEmbed = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return `<!-- Kitty Chat Feedback Widget - Compact -->
<div id="kitty-feedback-compact"></div>
<script>
(function() {
  const styles = \`
    .kitty-feedback-compact {
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
      .kitty-feedback-compact {
        background: #1f2937;
        border-color: #374151;
        color: white;
      }
      .kitty-feedback-compact p { color: #d1d5db; }
      .kitty-feedback-compact button:hover { background: #374151 !important; }
    }
    .kitty-feedback-compact p {
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

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  const emojis = [
    { emoji: '😭', tooltip: 'Muito ruim' },
    { emoji: '😕', tooltip: 'Ruim' },
    { emoji: '😐', tooltip: 'Ok' },
    { emoji: '😊', tooltip: 'Bom' },
    { emoji: '🤩', tooltip: 'Excelente' }
  ];

  const widget = document.getElementById('kitty-feedback-compact');
  widget.innerHTML = \`
    <div class="kitty-feedback-compact">
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

  const emojiButtons = widget.querySelectorAll('.kitty-feedback-emoji');
  const messageDiv = widget.querySelector('#feedback-message');

  emojiButtons.forEach((button, index) => {
    button.addEventListener('click', async () => {
      emojiButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      emojiButtons.forEach(btn => btn.disabled = true);
      messageDiv.textContent = 'Enviando...';

      try {
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
</script>`;
  };

  const generateFullEmbed = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    return `<!-- Kitty Chat Feedback Widget - Full -->
<div id="kitty-feedback-full"></div>
<script>
(function() {
  const styles = \`
    .kitty-feedback-full {
      background: white;
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 500px;
      margin: 40px auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-feedback-full {
        background: #1f2937;
        color: white;
      }
      .kitty-feedback-full h3 { color: white; }
      .kitty-feedback-full p { color: #d1d5db; }
      .kitty-feedback-full textarea {
        background: #374151;
        border-color: #4b5563;
        color: white;
      }
      .kitty-feedback-full textarea::placeholder { color: #9ca3af; }
    }
    .kitty-feedback-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .kitty-feedback-icon {
      width: 48px;
      height: 48px;
      background: black;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      color: white;
      font-size: 20px;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-feedback-icon {
        background: white;
        color: black;
      }
    }
    .kitty-feedback-full h3 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #111827;
    }
    .kitty-feedback-full p {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    .kitty-carousel {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      margin-bottom: 24px;
      position: relative;
      height: 80px;
    }
    .kitty-carousel-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 8px;
      transition: all 0.2s;
    }
    .kitty-carousel-btn:hover {
      color: #4b5563;
      transform: scale(1.1);
    }
    .kitty-carousel-track {
      position: relative;
      width: 256px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kitty-emoji-item {
      position: absolute;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kitty-emoji-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 2px solid transparent;
      transition: all 0.3s;
    }
    .kitty-emoji-item.center .kitty-emoji-circle {
      background: #dcfce7;
      border-color: #86efac;
      box-shadow: 0 4px 12px rgba(134, 239, 172, 0.3);
    }
    .kitty-tooltip {
      position: absolute;
      top: -48px;
      left: 50%;
      transform: translateX(-50%);
      background: #1f2937;
      color: white;
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 20;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-tooltip {
        background: #e5e7eb;
        color: #1f2937;
      }
    }
    .kitty-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #1f2937;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-tooltip::after {
        border-top-color: #e5e7eb;
      }
    }
    .kitty-feedback-full textarea {
      width: 100%;
      height: 96px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      margin-bottom: 24px;
      transition: all 0.2s;
    }
    .kitty-feedback-full textarea:focus {
      outline: none;
      border-color: #86efac;
      box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.2);
    }
    .kitty-submit-btn {
      width: 100%;
      background: linear-gradient(to right, #22c55e, #16a34a);
      color: white;
      border: none;
      border-radius: 12px;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .kitty-submit-btn:hover {
      background: linear-gradient(to right, #16a34a, #15803d);
      box-shadow: 0 8px 16px rgba(34, 197, 94, 0.3);
    }
    .kitty-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .kitty-message {
      background: #f3f4f6;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: center;
      font-size: 14px;
      color: #374151;
    }
    @media (prefers-color-scheme: dark) {
      .kitty-message {
        background: #374151;
        color: #d1d5db;
      }
    }
  \`;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

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

  let currentIndex = 2;
  let isSubmitting = false;
  let showTooltip = true;

  const widget = document.getElementById('kitty-feedback-full');
  widget.innerHTML = \`
    <div class="kitty-feedback-full">
      <div class="kitty-feedback-header">
        <div class="kitty-feedback-icon">💬</div>
        <h3>Como foi sua experiência?</h3>
        <p>Sua opinião é muito importante para nós. Avalie sua experiência e deixe um comentário.</p>
      </div>
      <div class="kitty-carousel">
        <button class="kitty-carousel-btn" id="prev-btn">◀</button>
        <div class="kitty-carousel-track" id="carousel-track"></div>
        <button class="kitty-carousel-btn" id="next-btn">▶</button>
      </div>
      <div id="message-container"></div>
      <textarea id="comment-input" placeholder="Deixe um comentário (opcional)..."></textarea>
      <button class="kitty-submit-btn" id="submit-btn">Enviar feedback</button>
    </div>
  \`;

  function renderCarousel() {
    const track = document.getElementById('carousel-track');
    track.innerHTML = '';

    emojis.forEach((item, index) => {
      const isCenter = index === currentIndex;
      const distance = Math.abs(index - currentIndex);
      const offset = (index - currentIndex) * 48;
      const scale = isCenter ? 1.25 : 0.8;
      const opacity = distance > 2 ? 0 : isCenter ? 1 : 0.4;

      const emojiItem = document.createElement('div');
      emojiItem.className = 'kitty-emoji-item' + (isCenter ? ' center' : '');
      emojiItem.style.transform = \`translateX(\${offset}px) scale(\${scale})\`;
      emojiItem.style.opacity = opacity;

      emojiItem.innerHTML = \`
        <div class="kitty-emoji-circle">\${item.emoji}</div>
        \${isCenter && showTooltip ? \`<div class="kitty-tooltip">\${item.tooltip}</div>\` : ''}
      \`;

      track.appendChild(emojiItem);
    });
  }

  function showMessage(text) {
    const container = document.getElementById('message-container');
    container.innerHTML = \`<div class="kitty-message">\${text}</div>\`;
  }

  function clearMessage() {
    document.getElementById('message-container').innerHTML = '';
  }

  document.getElementById('prev-btn').addEventListener('click', () => {
    if (!isSubmitting) {
      currentIndex = currentIndex === 0 ? emojis.length - 1 : currentIndex - 1;
      showTooltip = true;
      renderCarousel();
      setTimeout(() => {
        showTooltip = false;
        renderCarousel();
      }, 3000);
    }
  });

  document.getElementById('next-btn').addEventListener('click', () => {
    if (!isSubmitting) {
      currentIndex = currentIndex === emojis.length - 1 ? 0 : currentIndex + 1;
      showTooltip = true;
      renderCarousel();
      setTimeout(() => {
        showTooltip = false;
        renderCarousel();
      }, 3000);
    }
  });

  document.getElementById('submit-btn').addEventListener('click', async () => {
    if (isSubmitting) return;

    isSubmitting = true;
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('submit-btn').textContent = 'Enviando...';
    clearMessage();

    const comment = document.getElementById('comment-input').value;

    try {
      const response = await fetch('${supabaseUrl}/rest/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': '${supabaseKey}',
          'Authorization': 'Bearer ${supabaseKey}',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          emoji: emojis[currentIndex].emoji,
          emotion: emojis[currentIndex].tooltip,
          comment: comment || null,
          post_id: window.location.pathname,
          created_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        showMessage('✅ Feedback enviado com sucesso! Obrigado pela sua avaliação.');
        document.getElementById('comment-input').value = '';
        setTimeout(() => clearMessage(), 5000);
      } else {
        throw new Error('Erro na resposta');
      }
    } catch (error) {
      showMessage('❌ Erro ao enviar feedback. Tente novamente.');
      setTimeout(() => clearMessage(), 5000);
    } finally {
      isSubmitting = false;
      document.getElementById('submit-btn').disabled = false;
      document.getElementById('submit-btn').textContent = 'Enviar feedback';
    }
  });

  renderCarousel();
  setTimeout(() => {
    showTooltip = false;
    renderCarousel();
  }, 3000);
})();
</script>`;
  };

  const embedCode = mode === 'compact' ? generateCompactEmbed() : generateFullEmbed();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Codigo Embed - Versao {mode === 'compact' ? 'Compacta' : 'Completa'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Cole este codigo no seu blog. Funciona com tema automatico e mantem conexao com o banco de dados.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-160px)]">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <pre className="text-xs text-gray-800 dark:text-gray-200 overflow-x-auto whitespace-pre-wrap break-words">
              {embedCode}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={handleCopy}
            className={`flex-1 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
              copied
                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Copy size={18} />
            {copied ? 'Copiado!' : 'Copiar codigo'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
