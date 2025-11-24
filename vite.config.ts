import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  // process.cwd() 获取当前工作目录
  // '' 表示加载所有环境变量，不管是否有 VITE_ 前缀
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // 关键配置：在构建时，将代码中的 process.env.API_KEY 替换为真实的值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});