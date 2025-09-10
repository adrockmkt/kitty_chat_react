import { supabase } from '../lib/supabase';

export interface Feedback {
  emoji: string;
  emotion: string;
  comment?: string | null;
  post_id?: string;
}

export interface FeedbackStat {
  emotion: string;
  count: number;
  percentage: number;
}

export interface FeedbackStatsResponse {
  stats: FeedbackStat[];
  total: number;
}

export async function submitFeedback(feedback: Feedback) {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          emoji: feedback.emoji,
          emotion: feedback.emotion,
          comment: feedback.comment,
          post_id: feedback.post_id || null,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao enviar feedback:', error);
      throw new Error('Falha ao enviar feedback');
    }

    return data;
  } catch (error) {
    console.error('Erro no serviço de feedback:', error);
    throw error;
  }
}

export async function getFeedbackStats(): Promise<FeedbackStatsResponse> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('emotion');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Falha ao carregar estatísticas');
    }

    if (!data || data.length === 0) {
      return { stats: [], total: 0 };
    }

    // Contar ocorrências de cada emoção
    const emotionCounts: { [key: string]: number } = {};
    data.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    const total = data.length;
    
    // Converter para array com percentuais
    const stats: FeedbackStat[] = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      percentage: Math.round((count / total) * 100)
    }));

    // Ordenar por contagem (maior primeiro)
    stats.sort((a, b) => b.count - a.count);

    return { stats, total };
  } catch (error) {
    console.error('Erro no serviço de estatísticas:', error);
    throw error;
  }
}