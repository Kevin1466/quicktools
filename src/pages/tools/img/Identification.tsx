import StructuredOcrPage from './StructuredOcrPage'
import { getToolById } from '@/data/toolsFromJson'

const identificationFields = [
  { key: 'name', label: '姓名', description: '证件上的姓名' },
  { key: 'gender', label: '性别', description: '证件上的性别' },
  { key: 'ethnicity', label: '民族', description: '证件上的民族' },
  { key: 'birthDate', label: '出生日期', description: '证件上的出生日期' },
  { key: 'address', label: '住址', description: '证件上的住址' },
  { key: 'idNumber', label: '公民身份号码', description: '18位身份证号码' },
  { key: 'authority', label: '签发机关', description: '背面签发机关，如有则提取' },
  { key: 'validPeriod', label: '有效期限', description: '背面有效期限，如有则提取' },
]

const Identification: React.FC = () => {
  const tool = getToolById('identification')

  if (!tool) return null

  return (
    <StructuredOcrPage
      tool={tool}
      documentName="身份证"
      hintText="上传身份证照片后提取姓名、性别、民族、出生日期、住址和身份证号码等字段"
      fields={identificationFields}
      extraPrompt="如果图片只包含身份证正面，就优先提取正面字段；如果包含背面，也同时提取签发机关和有效期限。身份证号码请保持原始格式。"
    />
  )
}

export default Identification
