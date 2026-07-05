
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取工具数据
const toolsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sources/tools.json'), 'utf8'));

// 筛选出数据换算工具
const dataTools = toolsData.filter(tool => tool.category === 'data');

console.log('=== 数据换算工具列表 ===\n');
dataTools.forEach((tool, index) => {
  // 提取 toolId
  const idParts = tool.id.split('_');
  let toolId = idParts.slice(1).join('-') || idParts[0];
  
  // 检查是否已实现（从 toolsFromJson.ts 的 implementedToolIds 来判断）
  const implementedToolIds = new Set([
    'hexconvert',
    'timestamp',
    'temperaturetrans',
    'lengthconvert',
    'byte-cal',
    'num2zh',
    'bmi',
    'datecal',
    'calculator',
    'partition',
    'wuxianyijin',
    'mortgage'
  ]);
  
  const isImplemented = implementedToolIds.has(toolId) || implementedToolIds.has(tool.id);
  
  console.log(`${index + 1}. ${tool.name}`);
  console.log(`   Tool ID: ${toolId}`);
  console.log(`   详情页: ${tool.detail_page_url}`);
  console.log(`   状态: ${isImplemented ? '已实现' : '未实现'}`);
  console.log('');
});

console.log(`\n总计: ${dataTools.length} 个数据换算工具`);
