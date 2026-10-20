import type { Category } from '../types/category'

export const categories: Category[] = [
  { id: 'all', name: '全部', icon: 'LayoutGrid', description: '查看全部工具' },
  { id: 'img', name: '图片工具', icon: 'Image', description: '图片处理、压缩、识别等' },
  { id: 'pdf', name: 'PDF转换工具', icon: 'FileText', description: 'PDF转换、编辑、加水印等' },
  { id: 'data', name: '数据换算工具', icon: 'Calculator', description: '进制/单位/日期等换算' },
  { id: 'life', name: '生活娱乐工具', icon: 'Smile', description: '生活常用、娱乐小工具' },
  { id: 'education', name: '教育工具', icon: 'GraduationCap', description: '学习辅助、题库与练习' },
  { id: 'text', name: '文本工具', icon: 'Type', description: '文本处理、比较、转换' },
  { id: 'doc', name: '文档转换工具', icon: 'FileJson', description: 'Word/Excel/PPT等格式转换' },
  { id: 'develop', name: '开发工具', icon: 'Code', description: '编码/解析/格式化等' },
  { id: 'video', name: '视频工具', icon: 'Video', description: '录屏、视频处理' },
  { id: 'pc_plugin', name: '浏览器插件', icon: 'Puzzle', description: '插件能力与下载入口（开发中）' },
]

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id)
}
