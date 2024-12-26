export const includesText = (text: string, searchQuery: string): boolean => {
  return text.toLowerCase().includes(searchQuery.toLowerCase());
};

export const textWithHighlight = (text: string, substring?: string) => {
  if (!substring) return text;
  const regex = new RegExp(`(${substring})`, 'gi');
  return text.replace(regex, '<span class="bg-yellow-300 font-semibold">$1</span>');
};
