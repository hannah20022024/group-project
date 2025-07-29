# Portfolio API 测试

这个测试套件为 `first5.js` 中的投资组合买卖 API 提供了全面的测试覆盖。

## 测试覆盖范围

### Buy API (`/api/portfolio/buy`)
- ✅ 成功购买股票
- ✅ 无效输入验证（缺少参数、负数、零股数）
- ✅ 股票不在股票池中的情况
- ✅ Yahoo Finance API 失败处理
- ✅ 数据库错误处理

### Sell API (`/api/portfolio/sell`)
- ✅ 成功卖出股票
- ✅ 无效输入验证
- ✅ 持股不足的情况
- ✅ Yahoo Finance API 失败处理
- ✅ 部分卖出处理
- ✅ 数据库错误处理

## 运行测试

### 安装依赖
```bash
npm install
```

### 运行所有测试
```bash
npm test
```

### 运行测试并监听文件变化
```bash
npm run test:watch
```

### 运行特定测试文件
```bash
npx jest test/pofolio.test.js
```

### 生成测试覆盖率报告
```bash
npx jest --coverage
```

## 测试结构

### Mock 设置
- `mysql2/promise`: 模拟数据库连接和查询
- `yahoo-finance2`: 模拟股票价格 API

### 测试数据
- 使用真实的 API 请求格式
- 模拟数据库返回的数据结构
- 验证 API 响应的完整性

### 错误处理测试
- 验证各种错误情况下的正确响应
- 确保错误消息的一致性
- 测试数据库连接失败的情况

## 注意事项

1. 测试使用模拟数据，不会影响真实数据库
2. 所有外部 API 调用都被模拟
3. 测试覆盖了主要的业务逻辑和错误处理路径
4. 使用 `supertest` 进行 HTTP 请求测试
5. 使用 Jest 的 mock 功能隔离依赖

## 添加新测试

要添加新的测试用例：

1. 在相应的 `describe` 块中添加新的 `test` 函数
2. 设置必要的 mock 数据
3. 使用 `request(app)` 发送 HTTP 请求
4. 验证响应状态码和响应体
5. 验证数据库调用（如果需要）

示例：
```javascript
test('should handle new scenario', async () => {
  // Setup mocks
  mockDb.execute.mockResolvedValueOnce([mockData]);
  
  // Make request
  const response = await request(app)
    .post('/api/portfolio/buy')
    .send(requestData)
    .expect(expectedStatus);
    
  // Verify response
  expect(response.body).toEqual(expectedResponse);
});
``` 


