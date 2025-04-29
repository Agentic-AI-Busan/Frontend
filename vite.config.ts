import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api'로 시작하는 요청을 프록시합니다.
      '/api': {
        target: 'http://43.201.14.236:80', // 수정된 코드 (공백 없음)
        changeOrigin: true, // cross-origin 요청을 위해 필요한 설정
        // rewrite: (path) => path.replace(/^\/api/, '') // 필요에 따라 경로 재작성 (백엔드에서 /api 경로를 사용하지 않는 경우)
      },
    },
  },
})
