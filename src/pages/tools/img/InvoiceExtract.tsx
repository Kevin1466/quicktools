import StructuredOcrPage from './StructuredOcrPage'
import { getToolById } from '@/data/toolsFromJson'

const invoiceFields = [
  { key: 'invoiceType', label: '发票类型', description: '如增值税普通发票、专用发票、电子发票等' },
  { key: 'invoiceCode', label: '发票代码', description: '发票代码' },
  { key: 'invoiceNumber', label: '发票号码', description: '发票号码' },
  { key: 'issueDate', label: '开票日期', description: '发票上的开票日期' },
  { key: 'buyerName', label: '购买方名称', description: '购买方名称' },
  { key: 'sellerName', label: '销售方名称', description: '销售方名称' },
  { key: 'amountWithoutTax', label: '不含税金额', description: '金额合计或不含税金额' },
  { key: 'taxAmount', label: '税额', description: '税额合计' },
  { key: 'totalAmount', label: '价税合计', description: '价税合计，小写金额优先' },
  { key: 'remarks', label: '备注', description: '发票备注信息，如有则提取' },
]

const InvoiceExtract: React.FC = () => {
  const tool = getToolById('invoice-extract')

  if (!tool) return null

  return (
    <StructuredOcrPage
      tool={tool}
      documentName="发票"
      hintText="上传发票图片后提取代码、号码、日期、购买方、销售方和金额等关键字段"
      fields={invoiceFields}
      extraPrompt="请优先提取中国大陆常见发票中的核心字段。金额字段优先返回票面上的原始文本，如果没有明确字段则返回空字符串。"
    />
  )
}

export default InvoiceExtract
