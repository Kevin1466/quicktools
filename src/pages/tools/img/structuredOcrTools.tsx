import type { ComponentType } from 'react'
import StructuredOcrPage from './StructuredOcrPage'
import { getToolById } from '@/data/toolsFromJson'

interface StructuredField {
  key: string
  label: string
  description: string
}

interface StructuredOcrConfig {
  toolId: string
  documentName: string
  hintText: string
  fields: StructuredField[]
  extraPrompt?: string
}

const createStructuredOcrTool = ({
  toolId,
  documentName,
  hintText,
  fields,
  extraPrompt,
}: StructuredOcrConfig): ComponentType => {
  const Component = () => {
    const tool = getToolById(toolId)

    if (!tool) return null

    return (
      <StructuredOcrPage
        tool={tool}
        documentName={documentName}
        hintText={hintText}
        fields={fields}
        extraPrompt={extraPrompt}
      />
    )
  }

  Component.displayName = `${toolId.replace(/[^a-z0-9]+/gi, '_')}_ocr_page`
  return Component
}

const textFields = [
  { key: 'text', label: '识别文本', description: '完整提取图片中的可见文字' },
]

export const structuredOcrToolComponents: Record<string, ComponentType> = {
  'bankcard-ocr': createStructuredOcrTool({
    toolId: 'bankcard-ocr',
    documentName: '银行卡',
    hintText: '上传银行卡照片后提取卡号、银行名称、卡类型与有效期等信息',
    fields: [
      { key: 'cardNumber', label: '银行卡号', description: '银行卡正面的完整卡号' },
      { key: 'bankName', label: '银行名称', description: '发卡银行名称' },
      { key: 'cardType', label: '卡类型', description: '储蓄卡、信用卡等' },
      { key: 'validPeriod', label: '有效期', description: '卡面显示的有效期，如有则提取' },
      { key: 'cardHolder', label: '持卡人', description: '卡面上的持卡人姓名，如有则提取' },
    ],
  }),
  'basic-ocr': createStructuredOcrTool({
    toolId: 'basic-ocr',
    documentName: '印刷文本',
    hintText: '上传图片后提取印刷体文字',
    fields: textFields,
  }),
  'handwriting-ocr': createStructuredOcrTool({
    toolId: 'handwriting-ocr',
    documentName: '手写文本',
    hintText: '上传图片后提取手写内容',
    fields: textFields,
  }),
  'ocr-advertise': createStructuredOcrTool({
    toolId: 'ocr-advertise',
    documentName: '广告图片文本',
    hintText: '上传广告海报或宣传图，提取主要文字内容',
    fields: textFields,
  }),
  'ocr-english': createStructuredOcrTool({
    toolId: 'ocr-english',
    documentName: '英文文本',
    hintText: '上传英文图片后提取英文内容',
    fields: textFields,
  }),
  'passport-ocr': createStructuredOcrTool({
    toolId: 'passport-ocr',
    documentName: '护照',
    hintText: '上传护照信息页，提取姓名、护照号、国籍等字段',
    fields: [
      { key: 'passportNumber', label: '护照号码', description: '护照号码' },
      { key: 'surname', label: '姓', description: '护照上的姓' },
      { key: 'givenName', label: '名', description: '护照上的名' },
      { key: 'nationality', label: '国籍', description: '护照上的国籍' },
      { key: 'birthDate', label: '出生日期', description: '护照上的出生日期' },
      { key: 'expiryDate', label: '有效期至', description: '护照到期日期' },
    ],
  }),
  'waybill': createStructuredOcrTool({
    toolId: 'waybill',
    documentName: '运单',
    hintText: '上传运单图片，提取运单号、寄收件信息等内容',
    fields: [
      { key: 'trackingNumber', label: '运单号', description: '运单上的主单号或快递单号' },
      { key: 'company', label: '物流公司', description: '快递或物流公司名称' },
      { key: 'sender', label: '寄件人', description: '寄件人姓名或公司' },
      { key: 'receiver', label: '收件人', description: '收件人姓名或公司' },
      { key: 'phone', label: '联系电话', description: '运单上的联系电话' },
      { key: 'address', label: '地址', description: '运单上的地址信息' },
    ],
  }),
  'container-ocr': createStructuredOcrTool({
    toolId: 'container-ocr',
    documentName: '集装箱编号',
    hintText: '上传集装箱图片后提取箱号、箱主代码和规格等字段',
    fields: [
      { key: 'containerNumber', label: '集装箱号', description: '完整集装箱编号' },
      { key: 'ownerCode', label: '箱主代码', description: '箱主代码' },
      { key: 'categoryIdentifier', label: '设备类别', description: '设备类别标识' },
      { key: 'serialNumber', label: '序列号', description: '序列号' },
      { key: 'checkDigit', label: '校验位', description: '校验位' },
      { key: 'isoCode', label: 'ISO 规格', description: '集装箱规格代码' },
    ],
  }),
  'carcard-ocr': createStructuredOcrTool({
    toolId: 'carcard-ocr',
    documentName: '车辆证件',
    hintText: '上传行驶证或车辆相关证件，提取车牌号、车主、VIN 等信息',
    fields: [
      { key: 'plateNumber', label: '车牌号', description: '车辆号牌号码' },
      { key: 'owner', label: '所有人', description: '车辆所有人姓名' },
      { key: 'vin', label: '车辆识别代号', description: 'VIN 码' },
      { key: 'engineNumber', label: '发动机号', description: '发动机号码' },
      { key: 'registerDate', label: '注册日期', description: '注册登记日期' },
      { key: 'useNature', label: '使用性质', description: '营运、非营运等' },
    ],
  }),
  'ocr-bizLicense': createStructuredOcrTool({
    toolId: 'ocr-bizLicense',
    documentName: '营业执照',
    hintText: '上传营业执照，提取企业名称、统一社会信用代码等字段',
    fields: [
      { key: 'companyName', label: '企业名称', description: '营业执照上的名称' },
      { key: 'creditCode', label: '统一社会信用代码', description: '18 位信用代码' },
      { key: 'legalRepresentative', label: '法定代表人', description: '法定代表人姓名' },
      { key: 'address', label: '住所', description: '营业执照上的住所' },
      { key: 'establishDate', label: '成立日期', description: '成立日期' },
      { key: 'businessScope', label: '经营范围', description: '经营范围描述' },
    ],
  }),
  'ocr-businesscard': createStructuredOcrTool({
    toolId: 'ocr-businesscard',
    documentName: '名片',
    hintText: '上传名片后提取姓名、公司、职位、电话与邮箱等信息',
    fields: [
      { key: 'name', label: '姓名', description: '名片上的姓名' },
      { key: 'company', label: '公司', description: '公司名称' },
      { key: 'position', label: '职位', description: '职位或部门' },
      { key: 'phone', label: '电话', description: '手机号或座机' },
      { key: 'email', label: '邮箱', description: '电子邮箱地址' },
      { key: 'address', label: '地址', description: '公司地址' },
    ],
  }),
  'ocr-permit': createStructuredOcrTool({
    toolId: 'ocr-permit',
    documentName: '港澳台证件',
    hintText: '上传港澳台相关证件，提取姓名、证件号、有效期等字段',
    fields: [
      { key: 'name', label: '姓名', description: '证件持有人姓名' },
      { key: 'cardNumber', label: '证件号码', description: '证件号码' },
      { key: 'birthDate', label: '出生日期', description: '出生日期' },
      { key: 'gender', label: '性别', description: '性别' },
      { key: 'validPeriod', label: '有效期限', description: '有效期限' },
      { key: 'issuePlace', label: '签发地/签发机关', description: '签发机构或地区' },
    ],
  }),
  'bankslip-ocr': createStructuredOcrTool({
    toolId: 'bankslip-ocr',
    documentName: '银行回单',
    hintText: '上传银行回单后提取账户、金额、日期等信息',
    fields: [
      { key: 'accountName', label: '账户名称', description: '银行回单上的账户名称' },
      { key: 'accountNumber', label: '账号', description: '账户号码' },
      { key: 'bankName', label: '银行名称', description: '银行名称' },
      { key: 'amount', label: '金额', description: '交易金额' },
      { key: 'date', label: '日期', description: '交易或回单日期' },
      { key: 'summary', label: '摘要', description: '交易摘要或用途' },
    ],
  }),
  'ocr-dutypaidproof': createStructuredOcrTool({
    toolId: 'ocr-dutypaidproof',
    documentName: '完税证明',
    hintText: '上传完税证明，提取纳税人、税种、金额和日期等字段',
    fields: [
      { key: 'taxpayer', label: '纳税人', description: '纳税人名称' },
      { key: 'taxCategory', label: '税种', description: '税种名称' },
      { key: 'amount', label: '税额', description: '应纳税额或实缴税额' },
      { key: 'date', label: '日期', description: '开具日期或税款所属期' },
      { key: 'certificateNumber', label: '凭证号', description: '完税证明编号' },
    ],
  }),
  'ocr-recognize-medical-invoice': createStructuredOcrTool({
    toolId: 'ocr-recognize-medical-invoice',
    documentName: '医疗票据',
    hintText: '上传医疗票据，提取医院、票据号、患者、金额等信息',
    fields: [
      { key: 'hospitalName', label: '医院名称', description: '医疗机构名称' },
      { key: 'invoiceNumber', label: '票据号码', description: '票据号码' },
      { key: 'patientName', label: '患者姓名', description: '患者姓名' },
      { key: 'totalAmount', label: '总金额', description: '票据总金额' },
      { key: 'date', label: '开票日期', description: '开票日期' },
      { key: 'insuranceType', label: '医保类型', description: '医保或结算方式，如有则提取' },
    ],
  }),
  'onlinetaxi-ocr': createStructuredOcrTool({
    toolId: 'onlinetaxi-ocr',
    documentName: '网约车行程单',
    hintText: '上传网约车行程单，提取平台、订单号、时间和金额等内容',
    fields: [
      { key: 'platform', label: '平台', description: '网约车平台名称' },
      { key: 'orderNumber', label: '订单号', description: '订单编号' },
      { key: 'date', label: '用车时间', description: '出行日期或时间' },
      { key: 'startLocation', label: '起点', description: '起始地点' },
      { key: 'endLocation', label: '终点', description: '终点地点' },
      { key: 'amount', label: '金额', description: '订单金额' },
    ],
  }),
}
