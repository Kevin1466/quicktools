import type { Tool, TagType } from '@/types';

const tagMapping: Record<string, TagType> = {
  'hot': 'hot',
  'new': 'new',
  '权益卡': 'vip',
  '权益': 'vip',
  '限免': 'free',
};

export const mapTags = (tags: string[]): TagType[] => {
  return tags
    .map(tag => tagMapping[tag])
    .filter((tag): tag is TagType => tag !== undefined);
};

export const tools: Tool[] = [
  {
    id: 'image-compress',
    name: '图片压缩',
    description: '智能压缩图片文件大小，支持JPG/PNG/WebP格式，在保持视觉质量的同时大幅减小体积，便于存储和传输。',
    category: 'img',
    icon: 'ImageDown',
    tags: ['hot'],
    route: '/tool/image-compress',
    status: 'done',
    isHot: true,
  },
  {
    id: 'id-photo-generator',
    name: '证件照生成',
    description: '快速生成各类证件照，支持多种尺寸和背景颜色，满足身份证、护照、签证等不同场景需求。',
    category: 'img',
    icon: 'User',
    tags: ['hot'],
    route: '/tool/id-photo-generator',
    status: 'doing',
    isHot: true,
  },
  {
    id: 'image-to-pdf',
    name: '图片转PDF',
    description: '将多张图片合并转换为PDF文件，支持JPG、PNG等格式，可调整图片顺序和页面布局。',
    category: 'img',
    icon: 'FileImage',
    route: '/tool/image-to-pdf',
    status: 'doing',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF转Word',
    description: '将PDF文件转换为可编辑的Word文档，保留原始排版和格式，支持文字版PDF的精准转换。',
    category: 'pdf',
    icon: 'FileText',
    tags: ['vip'],
    route: '/tool/pdf-to-word',
    status: 'done',
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF转Excel',
    description: '将PDF文件中的表格数据转换为可编辑的Excel文档，精准识别表格结构和数据。',
    category: 'pdf',
    icon: 'FileSpreadsheet',
    tags: ['vip'],
    route: '/tool/pdf-to-excel',
    status: 'doing',
  },
  {
    id: 'pdf-compress',
    name: 'PDF压缩',
    description: '减小PDF文件体积，优化存储和传输，特别适合包含大量图片的PDF文档。',
    category: 'pdf',
    icon: 'Minimize2',
    route: '/tool/pdf-compress',
    status: 'doing',
  },
  {
    id: 'pdf-watermark',
    name: 'PDF加水印',
    description: '为PDF文件添加自定义的水印信息，支持文字水印和图片水印，可调整位置、大小和透明度。',
    category: 'pdf',
    icon: 'Droplets',
    route: '/tool/pdf-watermark',
    status: 'doing',
  },
  {
    id: 'pdf-split',
    name: 'PDF拆分',
    description: '从PDF文件中提取指定页面并生成新的PDF文件，支持分离特定章节、提取重要页面。',
    category: 'pdf',
    icon: 'Scissors',
    tags: ['hot'],
    route: '/tool/pdf-split',
    status: 'doing',
    isHot: true,
  },
  {
    id: 'pdf-merge',
    name: 'PDF合并',
    description: '将多个PDF文件合并成一个单一的PDF文件，支持调整文件顺序，适用于文档整理和报告汇总。',
    category: 'pdf',
    icon: 'Merge',
    tags: ['hot'],
    route: '/tool/pdf-merge',
    status: 'doing',
    isHot: true,
  },
  {
    id: 'word-to-pdf',
    name: 'Word转PDF',
    description: '将Word文档（DOC/DOCX）转换为PDF格式，保持原始排版，方便分享和打印。',
    category: 'doc',
    icon: 'FileOutput',
    tags: ['hot'],
    route: '/tool/word-to-pdf',
    status: 'doing',
    isHot: true,
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel转PDF',
    description: '将Excel文件（XLS/XLSX）转换为PDF格式，保持表格布局和数据格式，便于分享和存档。',
    category: 'doc',
    icon: 'FileSpreadsheet',
    route: '/tool/excel-to-pdf',
    status: 'doing',
  },
  {
    id: 'ppt-to-pdf',
    name: 'PPT转PDF',
    description: '将PowerPoint演示文稿转换为PDF格式，保持幻灯片布局和格式，便于演示和分享。',
    category: 'doc',
    icon: 'Presentation',
    route: '/tool/ppt-to-pdf',
    status: 'doing',
  },
  {
    id: 'id-card-ocr',
    name: '身份证识别',
    description: '利用OCR技术识别身份证图片中的信息，包括姓名、身份证号码、出生日期等关键字段。',
    category: 'ocr',
    icon: 'CreditCard',
    tags: ['free'],
    route: '/tool/id-card-ocr',
    status: 'doing',
  },
  {
    id: 'bank-card-ocr',
    name: '银行卡识别',
    description: '快速准确提取中国大陆主流银行卡的关键信息，包括卡号、银行名称及有效期等。',
    category: 'ocr',
    icon: 'Banknote',
    tags: ['free'],
    route: '/tool/bank-card-ocr',
    status: 'doing',
  },
  {
    id: 'printed-ocr',
    name: '印刷体识别',
    description: '识别图片中的印刷文字，支持多种字体和语言，将图片文字转化为可编辑格式。',
    category: 'ocr',
    icon: 'FileText',
    tags: ['free'],
    route: '/tool/printed-ocr',
    status: 'doing',
  },
  {
    id: 'handwriting-ocr',
    name: '手写体识别',
    description: '识别图片中的手写文字，支持中文手写体识别，将手写笔迹转换为可编辑文本。',
    category: 'ocr',
    icon: 'PenTool',
    tags: ['free'],
    route: '/tool/handwriting-ocr',
    status: 'doing',
  },
  {
    id: 'garbage-sort',
    name: '垃圾分类查询',
    description: '查询生活中各类垃圾的正确分类方式，覆盖全国主要城市的垃圾分类标准，助力环保生活。',
    category: 'life',
    icon: 'Trash2',
    tags: ['hot'],
    route: '/tool/garbage-sort',
    status: 'done',
    isHot: true,
  },
  {
    id: 'today-eat',
    name: '今天吃什么',
    description: '解决选择困难症，随机推荐今日美食，支持自定义菜单和排除选项，让每餐都有惊喜。',
    category: 'life',
    icon: 'UtensilsCrossed',
    tags: ['hot'],
    route: '/tool/today-eat',
    status: 'doing',
    isHot: true,
  },
  {
    id: 'zitie-generator',
    name: '字帖生成',
    description: '在线生成个性化字帖，支持选择不同模板和年级，快速生成适合练习书写的字帖。',
    category: 'education',
    icon: 'BookOpen',
    route: '/tool/zitie-generator',
    status: 'doing',
  },
  {
    id: 'password-check',
    name: '密码安全检测',
    description: '检测密码强度，评估密码安全性，提供密码强度评分和改进建议，保护您的账户安全。',
    category: 'develop',
    icon: 'Shield',
    route: '/tool/password-check',
    status: 'doing',
  },
  {
    id: 'ai-poem-illustration',
    name: 'AI诗词配图',
    description: '输入古诗词，AI自动为其生成意境相符的精美插画，让诗词"活"起来。',
    category: 'ai',
    icon: 'Sparkles',
    tags: ['new', 'hot'],
    route: '/tool/ai-poem-illustration',
    status: 'doing',
    isNew: true,
    isHot: true,
  },
  {
    id: 'ai-remove-background',
    name: 'AI智能抠图',
    description: '一键去除图片背景，利用AI技术精准识别人像和物体主体，生成透明背景图片。',
    category: 'ai',
    icon: 'Wand2',
    tags: ['new', 'vip'],
    route: '/tool/ai-remove-background',
    status: 'doing',
    isNew: true,
  },
  {
    id: 'ai-code-explain',
    name: 'AI代码解释',
    description: '粘贴任意代码，AI用通俗易懂的中文解释代码逻辑和功能，支持多种编程语言。',
    category: 'ai',
    icon: 'Brain',
    tags: ['new'],
    route: '/tool/ai-code-explain',
    status: 'doing',
    isNew: true,
  },
];

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};

export const getToolsByCategory = (categoryId: string): Tool[] => {
  if (categoryId === 'all') {
    return tools;
  }
  return tools.filter(tool => tool.category === categoryId);
};

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase();
  return tools.filter(
    tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery)
  );
};

export const getHotTools = (): Tool[] => {
  return tools.filter(tool => tool.isHot);
};

export const getNewTools = (): Tool[] => {
  return tools.filter(tool => tool.isNew);
};
