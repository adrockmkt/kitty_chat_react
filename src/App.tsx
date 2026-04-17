import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  BarChart3,
  Eye,
  LineChart,
  LogOut,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

import CompactFeedback from './components/CompactFeedback';
import logo from './assets/logo-sem-fundo.png';
import { useTheme } from './hooks/useTheme';
import {
  getOverview,
  getPostDetail,
  getPosts,
  getSession,
  login,
  logout,
  type OverviewResponse,
  type PostDetailResponse,
  type PostStatsItem,
  type SessionUser,
} from './services/api';

function scoreTone(score: number) {
  if (score >= 1.2) {
    return { label: 'Muito positivo', className: 'text-emerald-600 dark:text-emerald-300' };
  }
  if (score > 0) {
    return { label: 'Positivo', className: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (score <= -1.2) {
    return { label: 'Muito negativo', className: 'text-rose-600 dark:text-rose-300' };
  }
  if (score < 0) {
    return { label: 'Negativo', className: 'text-rose-600 dark:text-rose-400' };
  }

  return { label: 'Neutro', className: 'text-slate-600 dark:text-slate-300' };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(value));
}

function StatCard({
  title,
  value,
  hint,
  icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_30px_rgba(148,163,184,0.14)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{title}</span>
        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 p-2 text-orange-500 dark:text-orange-300">
          {icon}
        </span>
      </div>
      <div className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</div>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function RankingTable({
  title,
  posts,
  emptyMessage,
  onSelect,
}: {
  title: string;
  posts: PostStatsItem[];
  emptyMessage: string;
  onSelect: (post: PostStatsItem) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] shadow-[0_16px_30px_rgba(148,163,184,0.12)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-none">
      <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
        <BarChart3 size={18} className="text-orange-500 dark:text-slate-300" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>

      {posts.length === 0 ? (
        <div className="px-5 py-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto">
          {posts.map((post, index) => {
            const tone = scoreTone(post.averageSentiment);

            return (
              <button
                key={`${title}-${post.postPath}`}
                type="button"
                onClick={() => onSelect(post)}
                className={`w-full px-5 py-4 text-left transition hover:bg-orange-50 dark:hover:bg-slate-900/70 ${
                  index > 0 ? 'border-t border-slate-200 dark:border-slate-700' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{post.postTitle || post.postPath}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{post.postPath}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{post.totalReactions} reações</p>
                    <p className={`text-xs ${tone.className}`}>{tone.label}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoginScreen({
  loading,
  error,
  onSubmit,
}: {
  loading: boolean;
  error: string;
  onSubmit: (username: string, password: string) => Promise<void>;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(username, password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fff1e8_0%,#fff8f4_38%,#f8fafc_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,#111827_0%,#020617_52%,#020617_100%)]">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white/95 p-8 shadow-[0_24px_60px_rgba(148,163,184,0.22)] dark:border-slate-800 dark:bg-slate-900/90 dark:shadow-[0_30px_80px_rgba(2,6,23,0.65)]">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex w-fit items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl" />
            <div className="absolute inset-x-6 inset-y-4 rounded-full bg-rose-500/20 blur-xl" />
            <div className="relative rounded-[28px] border border-orange-200/70 bg-white/90 px-6 py-4 shadow-[0_18px_45px_rgba(249,115,22,0.12)] dark:border-slate-700/80 dark:bg-slate-950/90 dark:shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
              <img
                src={logo}
                alt="Kitty Chat"
                className="h-24 w-auto object-contain drop-shadow-[0_10px_18px_rgba(249,115,22,0.22)]"
              />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Painel do Kitty Chat</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Entre com seu usuário e senha para ver o ranking de posts e a leitura de sentimento.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-700 dark:text-slate-300">Usuário</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="admin"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-700 dark:text-slate-300">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Sua senha"
            />
          </label>

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#ef4444_100%)] px-4 py-3 font-medium text-white shadow-[0_16px_30px_rgba(239,68,68,0.28)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Entrando...' : 'Acessar painel'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({
  user,
  overview,
  posts,
  postDetail,
  selectedPostPath,
  search,
  loading,
  error,
  onSearchChange,
  onRefresh,
  onSelectPost,
  onLogout,
}: {
  user: SessionUser;
  overview: OverviewResponse | null;
  posts: PostStatsItem[];
  postDetail: PostDetailResponse | null;
  selectedPostPath: string;
  search: string;
  loading: boolean;
  error: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => Promise<void>;
  onSelectPost: (post: PostStatsItem) => void;
  onLogout: () => Promise<void>;
}) {
  const selectedTone = useMemo(
    () => scoreTone(postDetail?.summary.averageSentiment ?? 0),
    [postDetail]
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff2e8_0%,#fff8f4_28%,#f8fafc_100%)] px-4 py-6 text-slate-900 dark:bg-[radial-gradient(circle_at_top,#111827_0%,#020617_52%,#020617_100%)] dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-[22px] bg-orange-500/15 blur-xl" />
              <div className="relative rounded-[22px] border border-orange-200/80 bg-white/90 px-3 py-2 shadow-[0_14px_28px_rgba(249,115,22,0.12)] dark:border-slate-700/80 dark:bg-slate-900/90 dark:shadow-[0_14px_28px_rgba(15,23,42,0.35)]">
                <img
                  src={logo}
                  alt="Kitty Chat"
                  className="h-14 w-auto object-contain drop-shadow-[0_8px_18px_rgba(249,115,22,0.2)] sm:h-16"
                />
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500 dark:text-slate-500">Kitty Chat</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                Painel de reações
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
                Visão geral de sentimento ao conteúdo do blog
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-[0_8px_18px_rgba(148,163,184,0.12)] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:shadow-none">
              Logado como <span className="font-medium text-slate-900 dark:text-white">{user.username}</span>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm text-orange-700 transition hover:border-orange-300 hover:bg-orange-100 dark:border-orange-400/50 dark:bg-orange-500/15 dark:text-orange-100 dark:hover:border-orange-300 dark:hover:bg-orange-500/25"
            >
              <RefreshCw size={15} />
              Atualizar
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 dark:border-rose-400/50 dark:bg-rose-500/15 dark:text-rose-100 dark:hover:border-rose-300 dark:hover:bg-rose-500/25"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total de reações"
            value={String(overview?.summary.totalReactions ?? 0)}
            hint="Todas as interações registradas pelo widget"
            icon={<BarChart3 size={18} />}
          />
          <StatCard
            title="Posts rastreados"
            value={String(overview?.summary.trackedPosts ?? 0)}
            hint="Quantidade de URLs ou paths com reação"
            icon={<Eye size={18} />}
          />
          <StatCard
            title="Sentimento médio"
            value={(overview?.summary.averageSentiment ?? 0).toFixed(2)}
            hint="Média consolidada do score dos emojis"
            icon={<LineChart size={18} />}
          />
          <StatCard
            title="Taxa positiva"
            value={`${(overview?.summary.positiveRate ?? 0).toFixed(1)}%`}
            hint="Percentual de reações com sentimento positivo"
            icon={<TrendingUp size={18} />}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_30px_rgba(148,163,184,0.12)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-none">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Visão por URL</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Filtre posts, veja o ranking e abra o detalhe de um conteúdo específico.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Buscar por URL, path ou título"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white lg:max-w-sm"
                />
              </div>

              {loading ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Carregando estatísticas...</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-slate-600 dark:text-slate-400">Nenhum post encontrado para este filtro.</p>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">Post</th>
                          <th className="px-4 py-3 font-medium">Reações</th>
                          <th className="px-4 py-3 font-medium">Sentimento</th>
                          <th className="px-4 py-3 font-medium">Última reação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => {
                          const tone = scoreTone(post.averageSentiment);
                          const isSelected = selectedPostPath === post.postPath;

                          return (
                            <tr
                              key={post.postPath}
                              className={`cursor-pointer border-t border-slate-200 transition hover:bg-orange-50 dark:border-slate-800 dark:hover:bg-slate-900/80 ${
                                isSelected
                                  ? 'bg-[linear-gradient(90deg,rgba(249,115,22,0.1)_0%,rgba(255,247,237,0.9)_100%)] dark:bg-[linear-gradient(90deg,rgba(249,115,22,0.1)_0%,rgba(15,23,42,0.2)_100%)]'
                                  : 'bg-white/80 dark:bg-slate-950/40'
                              }`}
                              onClick={() => onSelectPost(post)}
                            >
                              <td className="px-4 py-4">
                                <p className="font-medium text-slate-900 dark:text-white">{post.postTitle || post.postPath}</p>
                                <p className="mt-1 text-xs text-slate-500">{post.postPath}</p>
                              </td>
                              <td className="px-4 py-4 text-slate-700 dark:text-slate-200">{post.totalReactions}</td>
                              <td className={`px-4 py-4 ${tone.className}`}>
                                {post.averageSentiment.toFixed(2)} · {tone.label}
                              </td>
                              <td className="px-4 py-4 text-slate-500 dark:text-slate-400">
                                {post.lastReactionAt ? formatDate(post.lastReactionAt) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <RankingTable
                title="Ranking por volume"
                posts={overview?.topPosts ?? []}
                emptyMessage="Sem dados suficientes ainda."
                onSelect={onSelectPost}
              />
              <RankingTable
                title="Melhor sentimento"
                posts={overview?.bestPosts ?? []}
                emptyMessage="Sem dados suficientes ainda."
                onSelect={onSelectPost}
              />
              <RankingTable
                title="Pior sentimento"
                posts={overview?.worstPosts ?? []}
                emptyMessage="Sem dados suficientes ainda."
                onSelect={onSelectPost}
              />
            </div>
          </div>

          <div className="space-y-6">
            <CompactFeedback showEmbedTools onFeedbackSent={() => void onRefresh()} />

            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_30px_rgba(148,163,184,0.12)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-300" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Últimos 30 dias</h2>
              </div>
              <div className="space-y-3">
                {(overview?.timeline ?? []).slice(-7).map((point) => (
                  <div key={point.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">{formatDate(point.day)}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {point.count} reações · score {point.averageSentiment.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-900">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-rose-500"
                        style={{ width: `${Math.min(point.count * 12, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                {overview?.timeline.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">A linha do tempo aparece quando houver reações registradas.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_30px_rgba(148,163,184,0.12)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-none">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Distribuição dos emojis</h2>
              <div className="mt-4 space-y-3">
                {(overview?.emojiBreakdown ?? []).map((item) => (
                  <div key={item.emoji} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.emoji} {item.emotionLabel}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.count} ({(item.percentage ?? 0).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-900">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-orange-400 via-amber-300 to-rose-500"
                        style={{ width: `${Math.min(item.percentage ?? 0, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}

                {overview?.emojiBreakdown.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">As reações vão aparecer aqui assim que o widget receber cliques.</p>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-[0_16px_30px_rgba(148,163,184,0.12)] dark:border-slate-700/70 dark:bg-[linear-gradient(180deg,rgba(30,41,59,0.96)_0%,rgba(15,23,42,0.96)_100%)] dark:shadow-none">
              <div className="mb-4 flex items-center gap-2">
                <Eye size={18} className="text-orange-300" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Detalhe do post selecionado</h2>
              </div>

              {postDetail ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">{postDetail.summary.postTitle}</p>
                    <p className="mt-1 break-all text-xs text-slate-500">{postDetail.summary.postUrl}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Reações</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                        {postDetail.summary.totalReactions}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Sentimento</p>
                      <p className={`mt-2 text-2xl font-semibold ${selectedTone.className}`}>
                        {postDetail.summary.averageSentiment.toFixed(2)}
                      </p>
                      <p className={`mt-1 text-sm ${selectedTone.className}`}>{selectedTone.label}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {postDetail.emojiBreakdown.map((item) => (
                      <div
                        key={`${postDetail.summary.postPath}-${item.emoji}`}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-200">
                          {item.emoji} {item.emotionLabel}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{item.count}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Timeline</h3>
                    <div className="space-y-2">
                      {postDetail.timeline.map((point) => (
                        <div
                          key={`${postDetail.summary.postPath}-${point.day}`}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/40"
                        >
                          <span className="text-slate-700 dark:text-slate-300">{formatDate(point.day)}</span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {point.count} reações · score {point.averageSentiment.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {postDetail.timeline.length === 0 ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400">Sem histórico suficiente para este post.</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Selecione um post na tabela ou em um ranking para ver o detalhamento por URL.
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  useTheme();

  const [session, setSession] = useState<SessionUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [posts, setPosts] = useState<PostStatsItem[]>([]);
  const [postDetail, setPostDetail] = useState<PostDetailResponse | null>(null);
  const [selectedPostPath, setSelectedPostPath] = useState('');
  const [search, setSearch] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  useEffect(() => {
    async function bootstrapSession() {
      try {
        const response = await getSession();
        setSession(response.user);
      } catch {
        setSession(null);
      } finally {
        setAuthChecking(false);
      }
    }

    void bootstrapSession();
  }, []);

  const refreshDashboard = useCallback(async (searchTerm = search) => {
    if (!session) {
      return;
    }

    setDashboardLoading(true);
    setDashboardError('');

    try {
      const [overviewData, postsData] = await Promise.all([getOverview(), getPosts(searchTerm)]);
      setOverview(overviewData);
      setPosts(postsData.posts);

      const fallbackPost =
        postsData.posts.find((post) => post.postPath === selectedPostPath) ?? postsData.posts[0] ?? null;

      if (fallbackPost) {
        setSelectedPostPath(fallbackPost.postPath);
        const detail = await getPostDetail({ path: fallbackPost.postPath });
        setPostDetail(detail);
      } else {
        setSelectedPostPath('');
        setPostDetail(null);
      }
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Não foi possível carregar o painel.';
      setDashboardError(nextMessage);
    } finally {
      setDashboardLoading(false);
    }
  }, [search, selectedPostPath, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const timer = window.setTimeout(() => {
      void refreshDashboard(search);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [refreshDashboard, search, session]);

  async function handleLogin(username: string, password: string) {
    setAuthLoading(true);
    setAuthError('');

    try {
      const response = await login(username, password);
      setSession(response.user);
      setSearch('');
      await refreshDashboard('');
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Não foi possível fazer login.';
      setAuthError(nextMessage);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    setSession(null);
    setOverview(null);
    setPosts([]);
    setPostDetail(null);
    setSelectedPostPath('');
  }

  async function handleSelectPost(post: PostStatsItem) {
    setSelectedPostPath(post.postPath);
    try {
      const detail = await getPostDetail({ path: post.postPath });
      setPostDetail(detail);
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : 'Não foi possível carregar este post.';
      setDashboardError(nextMessage);
    }
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Carregando painel...
      </div>
    );
  }

  if (!session) {
    return <LoginScreen loading={authLoading} error={authError} onSubmit={handleLogin} />;
  }

  return (
    <Dashboard
      user={session}
      overview={overview}
      posts={posts}
      postDetail={postDetail}
      selectedPostPath={selectedPostPath}
      search={search}
      loading={dashboardLoading}
      error={dashboardError}
      onSearchChange={setSearch}
      onRefresh={() => refreshDashboard()}
      onSelectPost={handleSelectPost}
      onLogout={handleLogout}
    />
  );
}

export default App;
