/**
 * Checks if the given text includes the search query, ignoring case sensitivity.
 *
 * @param text - The text to search within.
 * @param searchQuery - The query to search for.
 * @returns `true` if the search query is found in the text; otherwise, `false`.
 */
export const includesIgnoreCase = (text: string, searchQuery: string) => {
  return text.toLowerCase().includes(searchQuery.toLowerCase());
};

/**
 * Highlights occurrences of a substring in the given text by wrapping them in a span
 * element with specific styling. If no substring is provided, the text is returned unchanged.
 *
 * @param text - The text in which to highlight the substring.
 * @param substring - The substring to highlight.
 * @returns The HTML text with highlighted substring(s) or the original text if no substring is provided.
 */
export const highlightTextOccurrences = (text: string, substring?: string) => {
  if (!substring) return text;

  // Escape special characters in the substring
  const safeSubstring = substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeSubstring})`, 'gi');

  return text.replace(regex, '<span class="bg-yellow-300 font-semibold">$1</span>');
};
