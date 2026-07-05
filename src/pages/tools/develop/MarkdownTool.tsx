import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import python from 'highlight.js/lib/languages/python';
import shell from 'highlight.js/lib/languages/bash';
import {
  Heading1,
  Heading2,
  Bold,
  Italic,
  Strikethrough,
  Minus,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Indent,
  Outdent,
  Table,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Code2,
  Upload,
  Download,
  FileText,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Save,
} from 'lucide-react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import ActionButton from '@/components/common/ActionButton';
import { getToolById } from '@/data/toolsFromJson';

/* 初始化 highlight.js 语言注册 */
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', html);
hljs.registerLanguage('json', json);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', shell);
hljs.registerLanguage('shell', shell);

/* marked renderer 配置 */
marked.setOptions({
  gfm: true,
  breaks: true,
});

const defaultMd = `# Markdown 编辑器 ✨

支持完整 GFM 语法，**加粗**、*斜体*、~~删除线~~、\`行内代码\`。

## 代码块

\`\`\`typescript
export const hello = (name: string): string => \`hello \${name}\`;

console.log(hello('帮小忙'));
\`\`\`

## 任务列表

- [x] 实时双栏编辑 + 同步滚动
- [x] 语法高亮代码块
- [x] 自动保存到 LocalStorage（刷新不丢失）
- [x] 工具栏分组 + 撤销/重做
- [ ] 更多功能 ing
`;

/* 本地存储键名 */
const STORAGE_KEY = 'quicktools:markdown:v1';

const ToolbarButton: React.FC<{
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, disabled, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="h-9 px-2 flex items-center justify-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
  >
    {children}
  </button>
);

const MarkdownTool: React.FC = () => {
  const tool = getToolById('markdown');

  /* 状态管理 */
  const [md, setMd] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved || defaultMd;
  });
  const [history, setHistory] = useState<string[]>([md]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editAreaRef = useRef<HTMLDivElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);

  if (!tool) return null;

  /* 自动保存到 LocalStorage */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (md.trim()) {
        localStorage.setItem(STORAGE_KEY, md);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [md]);

  /* 历史记录管理 */
  const pushHistory = useCallback((newText: string) => {
    setHistory((prev) => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(newText);
      if (next.length > 100) next.shift();
      return next;
    });
    setHistoryIndex(historyIndex + 1);
  }, [historyIndex]);

  const handleMdChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMd(e.target.value);
  };

  const handleMdBlur = () => {
    if (history[historyIndex] !== md) {
      pushHistory(md);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setMd(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setMd(history[newIndex]);
    }
  };

  /* 在当前光标处插入文本（替换选区），并恢复光标 */
  const insertAtCursor = useCallback((before: string, after = '') => {
    const ta = textareaRef.current;
    if (!ta) {
      setMd(prev => prev + before + after);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = md.slice(start, end);
    const next = md.slice(0, start) + before + selected + after + md.slice(end);
    setMd(next);
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length;
      ta.setSelectionRange(pos, pos);
    });
  }, [md]);

  const wrapLine = useCallback((prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const lineStart = md.lastIndexOf('\n', start - 1) + 1;
    const before = md.slice(0, lineStart);
    const after = md.slice(lineStart);
    const next = before + prefix + after;
    setMd(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }, [md]);

  const toolbarActions = {
    h1: () => wrapLine('# '),
    h2: () => wrapLine('## '),
    bold: () => insertAtCursor('**', '**'),
    italic: () => insertAtCursor('*', '*'),
    strike: () => insertAtCursor('~~', '~~'),
    hr: () => insertAtCursor('\n---\n'),
    quote: () => wrapLine('> '),
    ul: () => wrapLine('- '),
    ol: () => wrapLine('1. '),
    task: () => wrapLine('- [ ] '),
    indent: () => wrapLine('  '),
    outdent: () => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const lineStart = md.lastIndexOf('\n', start - 1) + 1;
      const line = md.slice(lineStart);
      const stripped = line.replace(/^( {1,4}|\t)/, '');
      const next = md.slice(0, lineStart) + stripped + md.slice(lineStart + line.length);
      setMd(next);
    },
    table: () => {
      const tbl = `\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n| 内容 | 内容 | 内容 |\n`;
      insertAtCursor(tbl);
    },
    image: () => {
      const url = window.prompt('请输入图片地址（URL）', 'https://');
      if (url) insertAtCursor(`![图片描述](${url})`);
    },
    link: () => {
      const url = window.prompt('请输入链接地址（URL）', 'https://');
      if (url) insertAtCursor('[', `](${url})`);
    },
    code: () => insertAtCursor('`', '`'),
    codeBlock: () => insertAtCursor('\n```typescript\n', '\n```\n'),
  } as const;

  const copyMd = async () => {
    try {
      await navigator.clipboard.writeText(md);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(html);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportMd = () => downloadFile(md, 'document.md', 'text/markdown;charset=utf-8');
  const exportHtml = () => {
    const full = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Markdown导出</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;max-width:780px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1f2937}
  h1,h2,h3,h4,h5,h6{font-weight:700;margin:20px 0 12px;color:#111827}
  h1{font-size:1.75rem}h2{font-size:1.4rem}h3{font-size:1.2rem}
  pre{background:#f3f4f6;color:#1f2937;padding:12px 16px;border-radius:8px;overflow:auto;margin:12px 0}
  code{background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:Menlo,Monaco,monospace;font-size:.9em;color:#e11d48}
  pre code{background:transparent;padding:0;color:#1f2937;font-size:.875rem}
  table{border-collapse:collapse;width:100%;margin:12px 0}
  th,td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}
  th{background:#f9fafb;font-weight:600}
  blockquote{border-left:4px solid #e5e7eb;margin:12px 0;padding:8px 16px;background:#f9fafb;color:#4b5563;border-radius:0 4px 4px 0}
  img{max-width:100%;border-radius:6px;margin:8px 0}
  a{color:#3b6de3;text-decoration:none}a:hover{text-decoration:underline}
  hr{border:none;border-top:1px solid #e5e7eb;margin:16px 0}
</style></head><body>${html}</body></html>`;
    downloadFile(full, 'document.html', 'text/html;charset=utf-8');
  };

  const openFile = () => fileInputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setMd(text);
    e.target.value = '';
  };

  /* 同步滚动 */
  const handleEditScroll = () => {
    const el = editAreaRef.current;
    const pv = previewAreaRef.current;
    if (!el || !pv) return;
    const ratio = el.scrollTop / (el.scrollHeight - el.clientHeight);
    pv.scrollTop = ratio * (pv.scrollHeight - pv.clientHeight);
  };

  /* Markdown -> HTML */
  const html = useMemo(() => {
    const raw = marked.parse(md) as string;

    const cleaned = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'del', 's', 'a',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'table', 'thead', 'tbody', 'tr',
        'th', 'td', 'hr', 'img', 'input', 'span'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'type', 'checked', 'class'],
    });
    return cleaned;
  }, [md]);

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-7xl mx-auto space-y-5">
        {/* 顶部操作栏 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 工具栏：分组 */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
            {/* 基础格式化分组 */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <ToolbarButton title="一级标题" onClick={toolbarActions.h1}>
                <Heading1 size={18} />
              </ToolbarButton>
              <ToolbarButton title="二级标题" onClick={toolbarActions.h2}>
                <Heading2 size={18} />
              </ToolbarButton>
              <div className="w-px h-5 bg-gray-200 mx-1 my-auto" />
              <ToolbarButton title="加粗 Ctrl+B" onClick={toolbarActions.bold}>
                <Bold size={18} />
              </ToolbarButton>
              <ToolbarButton title="斜体 Ctrl+I" onClick={toolbarActions.italic}>
                <Italic size={18} />
              </ToolbarButton>
              <ToolbarButton title="删除线" onClick={toolbarActions.strike}>
                <Strikethrough size={18} />
              </ToolbarButton>
              <ToolbarButton title="分割线" onClick={toolbarActions.hr}>
                <Minus size={18} />
              </ToolbarButton>
            </div>

            {/* 列表分组 */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <ToolbarButton title="引用" onClick={toolbarActions.quote}>
                <Quote size={18} />
              </ToolbarButton>
              <ToolbarButton title="无序列表" onClick={toolbarActions.ul}>
                <List size={18} />
              </ToolbarButton>
              <ToolbarButton title="有序列表" onClick={toolbarActions.ol}>
                <ListOrdered size={18} />
              </ToolbarButton>
              <ToolbarButton title="任务列表" onClick={toolbarActions.task}>
                <CheckSquare size={18} />
              </ToolbarButton>
              <div className="w-px h-5 bg-gray-200 mx-1 my-auto" />
              <ToolbarButton title="缩进" onClick={toolbarActions.indent}>
                <Indent size={18} />
              </ToolbarButton>
              <ToolbarButton title="反缩进" onClick={toolbarActions.outdent}>
                <Outdent size={18} />
              </ToolbarButton>
            </div>

            {/* 插入分组 */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <ToolbarButton title="插入表格" onClick={toolbarActions.table}>
                <Table size={18} />
              </ToolbarButton>
              <ToolbarButton title="插入图片" onClick={toolbarActions.image}>
                <ImageIcon size={18} />
              </ToolbarButton>
              <ToolbarButton title="插入链接" onClick={toolbarActions.link}>
                <LinkIcon size={18} />
              </ToolbarButton>
              <div className="w-px h-5 bg-gray-200 mx-1 my-auto" />
              <ToolbarButton title="行内代码" onClick={toolbarActions.code}>
                <Code size={18} />
              </ToolbarButton>
              <ToolbarButton title="代码块" onClick={toolbarActions.codeBlock}>
                <Code2 size={18} />
              </ToolbarButton>
            </div>

            {/* 历史记录分组 */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <ToolbarButton title="撤销 Ctrl+Z" onClick={handleUndo} disabled={historyIndex === 0}>
                <Undo2 size={18} />
              </ToolbarButton>
              <ToolbarButton title="重做 Ctrl+Y" onClick={handleRedo} disabled={historyIndex === history.length - 1}>
                <Redo2 size={18} />
              </ToolbarButton>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Save size={14} />
                自动保存
              </span>
            </div>
          </div>

          {/* 文件操作栏 */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-t border-gray-100">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              onChange={onFileChange}
              className="hidden"
            />
            <ActionButton size="sm" variant="secondary" onClick={openFile}>
              <span className="flex items-center gap-1.5">
                <Upload size={15} />
                打开文件
              </span>
            </ActionButton>
            <ActionButton size="sm" variant="secondary" onClick={exportMd} disabled={!md}>
              <span className="flex items-center gap-1.5">
                <FileText size={15} />
                导出为 Markdown
              </span>
            </ActionButton>
            <ActionButton size="sm" variant="secondary" onClick={exportHtml} disabled={!md}>
              <span className="flex items-center gap-1.5">
                <Download size={15} />
                导出为 HTML
              </span>
            </ActionButton>
            <div className="ml-auto flex items-center gap-2">
              <ActionButton size="sm" variant="secondary" onClick={copyMd} disabled={!md}>
                <span className="flex items-center gap-1.5">
                  <Copy size={15} />
                  复制 Markdown
                </span>
              </ActionButton>
              <ActionButton size="sm" variant="secondary" onClick={copyHtml} disabled={!md}>
                <span className="flex items-center gap-1.5">
                  <Copy size={15} />
                  复制 HTML
                </span>
              </ActionButton>
              <ActionButton size="sm" variant="secondary" onClick={() => {
                setMd('');
                setHistory(['']);
                setHistoryIndex(0);
                localStorage.removeItem(STORAGE_KEY);
              }}>
                <span className="flex items-center gap-1.5">
                  <Trash2 size={15} />
                  清空
                </span>
              </ActionButton>
            </div>
          </div>
        </div>

        {/* 双栏编辑/预览区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 编辑区 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Code size={16} className="text-gray-500" />
              编辑
            </div>
            <div ref={editAreaRef} className="flex-1 overflow-auto">
              <textarea
                ref={textareaRef}
                value={md}
                onChange={handleMdChange}
                onBlur={handleMdBlur}
                onScroll={handleEditScroll}
                className="w-full h-[580px] p-5 bg-gray-50/70 focus:outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 cursor-text"
                spellCheck={false}
              />
            </div>
          </div>

          {/* 预览区 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <List size={16} className="text-gray-500" />
              预览
            </div>
            <div ref={previewAreaRef} className="flex-1 overflow-auto p-6">
              <div className="prose-content max-w-none">
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default MarkdownTool;
