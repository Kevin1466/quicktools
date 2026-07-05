import { useState } from 'react';
import { PDFDocument } from '@maxwbh/pdf-lib';
import { saveAs } from 'file-saver';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import FileUploader from '@/components/common/FileUploader';
import ActionButton from '@/components/common/ActionButton';
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI';
import { getToolById } from '@/data/toolsFromJson';
import { getFileNameWithoutExtension } from '@/utils/fileUtils';

const PdfPassword: React.FC = () => {
  const tool = getToolById('pdf-password');
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!tool) return null;

  const onFileSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      setError('请选择PDF文件');
      return;
    }
    setFile(f);
    setError('');
    setPassword('');
  };

  const handleEncrypt = async () => {
    if (!file) return;
    if (!password) {
      setError('请输入要设置的密码');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(data);

      const encryptedPdfBytes = await pdfDoc.save({
        encrypt: {
          userPassword: password,
          ownerPassword: password,
          permissions: {
            printing: true,
            copying: true,
            modifying: true,
            annotating: true,
            fillingForms: true,
            documentAssembly: true,
          },
        },
      });

      const blob = new Blob([encryptedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const base = getFileNameWithoutExtension(file.name);
      saveAs(blob, `${base}_encrypted.pdf`);
    } catch (err: any) {
      console.error(err);
      setError(`加密失败: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file) return;
    if (!password) {
      setError('请输入密码');
      return;
    }

    setBusy(true);
    setError('');
    try {
      const data = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(data, {
        password,
      });

      const decryptedPdfBytes = await pdfDoc.save();
      const blob = new Blob([decryptedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const base = getFileNameWithoutExtension(file.name);
      saveAs(blob, `${base}_decrypted.pdf`);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('password') || err.message?.includes('encrypt')) {
        setError('解密失败：密码错误或文件已损坏');
      } else {
        setError(`解密失败: ${err.message}`);
      }
    } finally {
      setBusy(false);
    }
  };

  const run = async () => {
    if (mode === 'encrypt') {
      await handleEncrypt();
    } else {
      await handleDecrypt();
    }
  };

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileUploader
            onFileSelect={onFileSelect}
            accept="application/pdf"
            placeholder="将文件拖拽到虚框内"
            primaryActionText="点击上传文件(小于20M)"
            showFormatHint={false}
          />
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader
                  fileName={file.name}
                  subtitle={mode === 'encrypt' ? '为 PDF 添加密码保护' : '移除 PDF 密码保护'}
                  onReselect={() => {
                    setFile(null);
                    setError('');
                  }}
                  disabled={busy}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="w-16 text-right">
                        <span className="text-gray-600">模式</span>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={mode === 'encrypt'}
                            onChange={() => setMode('encrypt')}
                            className="text-[#3b6de3] focus:ring-[#3b6de3]"
                          />
                          <span>加密</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={mode === 'decrypt'}
                            onChange={() => setMode('decrypt')}
                            className="text-[#3b6de3] focus:ring-[#3b6de3]"
                          />
                          <span>解密</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-16 text-right">
                        <span className="text-gray-600">密码</span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={mode === 'encrypt' ? '请输入要设置的密码' : '请输入该文档的密码'}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3]"
                        />
                      </div>
                    </div>
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={busy || !password}>
                      {mode === 'encrypt' ? '开始加密并下载' : '开始解密并下载'}
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="安全说明">
                  <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>
                      使用本地纯前端处理，文件不会上传到服务器。
                    </p>
                    <p className="text-orange-600">
                      加密后请妥善保管密码，遗忘密码无法恢复文件！
                    </p>
                  </div>
                </PdfInfoCard>
                <PdfInfoCard title="技术说明">
                  <div className="text-sm text-gray-600 leading-relaxed space-y-1">
                    <p>支持密码加密（AES-128/256 位）</p>
                    <p>完全浏览器端，零依赖</p>
                  </div>
                </PdfInfoCard>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  );
};

export default PdfPassword;
