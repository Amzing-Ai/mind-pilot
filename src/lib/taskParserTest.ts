import { parseTasksFromAIResponse } from './taskParser';

// 测试用例
const testResponse = `🎯 目标分析
快速制作一份营养均衡的早餐

📝 任务清单
准备食材 - 检查冰箱/储物柜，确定可用食材（如鸡蛋、面包、牛奶） (⏰ 5分钟 | 🔥🔥🔥🔥)
选择烹饪方式 - 根据食材决定做法（煎蛋/煮燕麦/烤面包） (⏰ 2分钟 | 🔥🔥🔥)
同步操作 - 同时处理多个步骤（边烤面包边热牛奶） (⏰ 10分钟 | 🔥🔥🔥)
💡 关键建议
优先使用现成食材节省时间
注意火候避免烧焦
🚀 下一步行动
立即打开冰箱确认鸡蛋和面包库存`;

console.log('测试AI回复解析:');
console.log('原始回复:', testResponse);
console.log('\n解析结果:');

const tasks = parseTasksFromAIResponse(testResponse);
tasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.content}`);
    console.log(`   优先级: ${task.priority}`);
    console.log(`   状态: ${task.status}`);
    console.log(`   预估时间: ${task.estimatedHours}小时`);
    console.log(`   截止时间: ${task.expiresAt}`);
    console.log('');
});

export { testResponse };
