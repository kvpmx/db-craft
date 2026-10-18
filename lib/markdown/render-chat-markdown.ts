import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import { marked } from 'marked';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);

const highlightCode = (code: string, lang?: string) => {
  if (lang && hljs.getLanguage(lang)) {
    return {
      language: lang,
      html: hljs.highlight(code, { language: lang }).value,
    };
  }

  const auto = hljs.highlightAuto(code, ['sql', 'json', 'javascript', 'typescript']);

  return {
    language: auto.language ?? 'plaintext',
    html: auto.value,
  };
};

let configured = false;

const configureMarked = () => {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  marked.use({
    renderer: {
      code({ text, lang }) {
        const { language, html } = highlightCode(text, lang);

        return `<pre class="hljs-block rounded-md"><code class="hljs language-${language}">${html}</code></pre>`;
      },
    },
    hooks: {
      postprocess(html) {
        return html
          .replaceAll('<table>', '<div class="md-table-wrap"><table>')
          .replaceAll('</table>', '</table></div>');
      },
    },
  });

  configured = true;
};

export const renderChatMarkdown = (content: string) => {
  if (!configured) configureMarked();

  const parsed = marked.parse(content, { async: false });

  return typeof parsed === 'string' ? parsed : '';
};
