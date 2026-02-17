/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },

  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-zustand': ['zustand'],
          'vendor-lucide': ['lucide-react'],
          'vendor-tiptap': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-underline',
            '@tiptap/extension-highlight',
            '@tiptap/extension-color',
            '@tiptap/extension-text-style',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-task-list',
            '@tiptap/extension-task-item',
            '@tiptap/extension-image',
            '@tiptap/extension-table',
            '@tiptap/extension-table-row',
            '@tiptap/extension-table-cell',
            '@tiptap/extension-table-header',
          ],
          'feature-workspace': [
            './src/features/workspace/stores/useWorkspaceStore.ts',
          ],
          'feature-projects': [
            './src/features/projects/stores/useProjectStore.ts',
          ],
          'vendor-pdfjs': ['pdfjs-dist'],
          'feature-ai': [
            './src/features/ai/stores/useMemoryStore.ts',
            './src/features/ai/stores/useAgentStore.ts',
            './src/features/ai/stores/useAIChatStore.ts',
          ],
          'feature-clawgpt': [
            './src/features/clawgpt/stores/useChannelStore.ts',
            './src/features/clawgpt/stores/useMessageStore.ts',
            './src/features/clawgpt/stores/useSkillStore.ts',
            './src/features/clawgpt/stores/useSoulStore.ts',
            './src/features/clawgpt/stores/useDeviceStore.ts',
            './src/features/clawgpt/stores/useGatewayStore.ts',
            './src/features/clawgpt/stores/useFleetStore.ts',
          ],
        },
      },
    },
  },

  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
