import { ExternalLink, ShieldCheck } from 'lucide-react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const VERIFY_URL = 'https://qian.tencent.com/verifySign'

const ContractVerificationTool: React.FC = () => {
  const tool = getToolById('contract-verification')

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="rounded-xl border border-[#dbe6ff] bg-[#f7faff] p-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 rounded-xl bg-white p-3 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-[#3b6de3]" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-gray-900">前往腾讯电子签进行合同验签</h2>
              <p className="text-sm leading-7 text-gray-600">
                这个工具在帮小忙原站并不是本地处理能力，而是跳转到腾讯电子签的官方验签页面。
                你可以在官方页面上传已签署的 PDF 合同，检查文件是否在签署后被篡改。
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={VERIFY_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#3b6de3] px-5 py-3 text-sm font-medium text-white hover:bg-[#2f5cd3] transition"
                >
                  打开腾讯电子签验签页
                  <ExternalLink className="h-4 w-4" />
                </a>
                <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                  外部服务，不在本站内处理文件
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
          <h3 className="text-base font-semibold text-gray-900">使用说明</h3>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-gray-600">
            <li>点击上方按钮，进入腾讯电子签官方合同验签页。</li>
            <li>上传已经通过腾讯电子签完成签署的 PDF 合同文件。</li>
            <li>等待官方系统校验签署信息与文件完整性。</li>
            <li>根据校验结果判断合同是否被篡改或签署状态是否有效。</li>
          </ol>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default ContractVerificationTool
