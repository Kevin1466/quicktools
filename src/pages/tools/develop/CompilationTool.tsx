import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Lang = 'c' | 'cpp' | 'java' | 'python' | 'javascript' | 'typescript' | 'go' | 'rust' | 'bash'

const templates: Record<Lang, string> = {
  c: `#include <stdio.h>\n\nint main() {\n  printf("Hello, World!\\n");\n  return 0;\n}\n`,
  cpp: `#include <iostream>\n\nint main() {\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n`,
  java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n`,
  python: `print("Hello, World!")\n`,
  javascript: `console.log("Hello, World!")\n`,
  typescript: `console.log("Hello, World!")\n`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, World!")\n}\n`,
  rust: `fn main() {\n  println!("Hello, World!");\n}\n`,
  bash: `#!/usr/bin/env bash\necho "Hello, World!"\n`,
}

const labels: Record<Lang, string> = {
  c: 'C',
  cpp: 'C++',
  java: 'Java',
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  go: 'Go',
  rust: 'Rust',
  bash: 'Bash',
}

const CompilationTool: React.FC = () => {
  const tool = getToolById('compilation')
  const [lang, setLang] = useState<Lang>('python')

  if (!tool) return null

  const code = useMemo(() => templates[lang], [lang])

  const copy = async () => {
    await navigator.clipboard.writeText(code)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-end">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">语言</div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              {Object.keys(labels).map(k => (
                <option key={k} value={k}>
                  {labels[k as Lang]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <ActionButton variant="secondary" onClick={copy}>
              复制代码
            </ActionButton>
          </div>
        </div>

        <pre className="w-full overflow-auto p-5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
          <code className="font-mono">{code}</code>
        </pre>
      </div>
    </ToolPageTemplate>
  )
}

export default CompilationTool

