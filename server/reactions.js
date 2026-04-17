export const reactionOptions = [
  { emoji: '😭', label: 'Muito ruim', score: -2 },
  { emoji: '😕', label: 'Ruim', score: -1 },
  { emoji: '😐', label: 'Ok', score: 0 },
  { emoji: '😊', label: 'Bom', score: 1 },
  { emoji: '🤩', label: 'Excelente', score: 2 },
];

export const reactionMap = new Map(
  reactionOptions.map((reaction) => [reaction.emoji, reaction])
);
