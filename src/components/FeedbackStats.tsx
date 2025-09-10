import { useState, useEffect } from 'react';
import { getFeedbackStats } from '../services/feedbackService';

interface FeedbackStat {
  emotion: string;
  count: number;
  percentage: number;
}

export default function FeedbackStats() {
  const [stats, setStats] = useState<FeedbackStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getFeedbackStats();
      setStats(data.stats);
      setTotal(data.total);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Estatísticas
        </h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 Estatísticas
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total de feedbacks: <span className="font-semibold text-gray-900 dark:text-white">{total}</span>
        </p>
      </div>

      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {stat.emotion}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {stat.count} ({stat.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stat.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {stats.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum feedback ainda
          </p>
        </div>
      )}
    </div>
  );
}