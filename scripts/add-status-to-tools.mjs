import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const statusMap = {
  '图片压缩': 'done',
  'PDF转Word': 'done',
  '垃圾分类查询': 'done',
  
  '证件照生成': 'doing',
  '图片转PDF': 'doing',
  'PDF转Excel': 'doing',
  'PDF压缩': 'doing',
  'PDF瘦身': 'doing',
  'PDF加水印': 'doing',
  'PDF拆分': 'doing',
  'PDF合并': 'doing',
  'Word转PDF': 'doing',
  'Excel转PDF': 'doing',
  'PPT转PDF': 'doing',
  '身份证识别': 'doing',
  '银行卡识别': 'doing',
  '印刷体识别': 'doing',
  '手写体识别': 'doing',
  '今天吃什么': 'doing',
  '字帖生成': 'doing',
  '密码安全检测': 'doing',
};

const toolsJsonPath = path.join(__dirname, '../sources/tools.json');

try {
  const data = fs.readFileSync(toolsJsonPath, 'utf-8');
  const tools = JSON.parse(data);
  
  const updatedTools = tools.map(tool => {
    const status = statusMap[tool.name] || 'todo';
    return {
      ...tool,
      status: status
    };
  });
  
  fs.writeFileSync(toolsJsonPath, JSON.stringify(updatedTools, null, 2), 'utf-8');
  
  let doneCount = 0, doingCount = 0, todoCount = 0;
  updatedTools.forEach(tool => {
    if (tool.status === 'done') doneCount++;
    else if (tool.status === 'doing') doingCount++;
    else todoCount++;
  });
  
  console.log('Status updated successfully!');
  console.log(`Total tools: ${updatedTools.length}`);
  console.log(`Done: ${doneCount}`);
  console.log(`Doing: ${doingCount}`);
  console.log(`Todo: ${todoCount}`);
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
