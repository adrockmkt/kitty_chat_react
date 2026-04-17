import { useMemo, useState } from 'react';
import { Code, Copy } from 'lucide-react';

import { getPublicAppUrl, reactionOptions } from '../lib/reactions';
import { submitReaction } from '../services/api';

interface CompactFeedbackProps {
  postId?: string;
  showEmbedTools?: boolean;
  onFeedbackSent?: (emoji: string) => void;
}

function buildEmbedCode(appUrl: string) {
  return `<!-- Kitty Chat Reacoes -->
<div id="kitty-reactions-widget"></div>
<script>
(function() {
  const apiUrl = '${appUrl}/api/reactions';
  const reactions = [
    { emoji: '😭', label: 'Muito ruim' },
    { emoji: '😕', label: 'Ruim' },
    { emoji: '😐', label: 'Ok' },
    { emoji: '😊', label: 'Bom' },
    { emoji: '🤩', label: 'Excelente' }
  ];

  const host = document.getElementById('kitty-reactions-widget');
  if (!host) return;

  const style = document.createElement('style');
  style.textContent = \`
    .kitty-reactions-card {
      background: #1f2937;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 24px;
      padding: 28px 24px;
      max-width: 640px;
      margin: 24px auto;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
      color: #e5e7eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .kitty-reactions-title {
      text-align: center;
      font-size: 16px;
      line-height: 1.5;
      color: #d1d5db;
      margin: 0 0 22px;
    }
    .kitty-reactions-row {
      display: flex;
      justify-content: center;
      gap: 18px;
      flex-wrap: wrap;
    }
    .kitty-reaction-button {
      width: 54px;
      height: 54px;
      border: none;
      border-radius: 999px;
      background: transparent;
      color: inherit;
      font-size: 29px;
      cursor: pointer;
      transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    }
    .kitty-reaction-button:hover {
      transform: translateY(-2px) scale(1.05);
      background: rgba(255, 255, 255, 0.06);
    }
    .kitty-reaction-button.is-selected {
      background: rgba(245, 158, 11, 0.14);
      box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.22);
    }
    .kitty-reactions-message {
      min-height: 22px;
      margin-top: 18px;
      text-align: center;
      font-size: 13px;
      color: #cbd5e1;
    }
    @media (max-width: 640px) {
      .kitty-reactions-card {
        border-radius: 20px;
        padding: 22px 18px;
      }
      .kitty-reactions-row {
        gap: 10px;
      }
      .kitty-reaction-button {
        width: 48px;
        height: 48px;
        font-size: 25px;
      }
    }
  \`;
  document.head.appendChild(style);

  host.innerHTML = \`
    <section class="kitty-reactions-card">
      <p class="kitty-reactions-title">Como voce avalia este conteudo?</p>
      <div class="kitty-reactions-row">
        \${reactions.map((reaction, index) => \`<button class="kitty-reaction-button" type="button" data-index="\${index}" title="\${reaction.label}" aria-label="\${reaction.label}">\${reaction.emoji}</button>\`).join('')}
      </div>
      <div class="kitty-reactions-message" id="kitty-reactions-message"></div>
    </section>
  \`;

  const buttons = Array.from(host.querySelectorAll('.kitty-reaction-button'));
  const message = host.querySelector('#kitty-reactions-message');

  async function sendReaction(index) {
    const reaction = reactions[index];
    buttons.forEach((button) => {
      button.disabled = true;
      button.classList.remove('is-selected');
    });
    buttons[index].classList.add('is-selected');
    message.textContent = 'Enviando...';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emoji: reaction.emoji,
          postUrl: window.location.href,
          postPath: window.location.pathname,
          postTitle: document.title
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar');
      }

      message.textContent = 'Obrigado pelo feedback!';
    } catch (error) {
      message.textContent = 'Nao foi possivel registrar a reacao.';
      buttons[index].classList.remove('is-selected');
    } finally {
      setTimeout(() => {
        buttons.forEach((button) => {
          button.disabled = false;
          button.classList.remove('is-selected');
        });
        message.textContent = '';
      }, 2500);
    }
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', function() {
      sendReaction(index);
    });
  });
})();
</script>`;
}

export default function CompactFeedback({
  postId,
  showEmbedTools = true,
  onFeedbackSent,
}: CompactFeedbackProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);
  const embedCode = useMemo(() => buildEmbedCode(getPublicAppUrl()), []);

  async function handleEmojiClick(emoji: string) {
    if (isSubmitting) {
      return;
    }

    setSelectedEmoji(emoji);
    setIsSubmitting(true);
    setMessage('');

    try {
      await submitReaction(emoji, postId);
      setMessage('Obrigado pelo feedback!');
      onFeedbackSent?.(emoji);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Nao foi possivel registrar a reacao.';
      setMessage(nextMessage);
      setSelectedEmoji(null);
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => {
        setMessage('');
        setSelectedEmoji(null);
      }, 2500);
    }
  }

  async function copyEmbedCode() {
    try {
      await navigator.clipboard.writeText(embedCode);
      setEmbedCopied(true);
      window.setTimeout(() => setEmbedCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar o embed:', error);
    }
  }

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 px-6 py-7 shadow-[0_18px_40px_rgba(148,163,184,0.16)] dark:border-slate-700/70 dark:bg-slate-800 dark:shadow-[0_24px_60px_rgba(15,23,42,0.4)]">
      {showEmbedTools && (
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Widget do blog</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Mesmo fluxo visual, agora apontando para sua API propria.</p>
          </div>
          <button
            onClick={copyEmbedCode}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-900"
          >
            {embedCopied ? <Copy size={14} /> : <Code size={14} />}
            {embedCopied ? 'Copiado' : 'Copiar embed'}
          </button>
        </div>
      )}

      <p className="mb-6 text-center text-[15px] text-slate-700 dark:text-slate-300">
        Como voce avalia este conteudo?
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
        {reactionOptions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => handleEmojiClick(reaction.emoji)}
            disabled={isSubmitting}
            aria-label={reaction.label}
            title={reaction.label}
            className={`flex h-12 w-12 items-center justify-center rounded-full text-[29px] transition duration-200 sm:h-14 sm:w-14 ${
              selectedEmoji === reaction.emoji
                ? 'scale-105 bg-amber-300/15 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.25)]'
                : 'hover:-translate-y-0.5 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/5'
            } ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {reaction.emoji}
          </button>
        ))}
      </div>

      <div className="mt-5 min-h-6 text-center text-sm text-slate-500 dark:text-slate-400">{message}</div>
    </section>
  );
}
