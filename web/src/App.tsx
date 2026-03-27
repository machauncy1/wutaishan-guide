import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AppRouter from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 缓存保留 24 小时，期间关闭浏览器再打开仍可秒开页面；
      // 超过 24 小时缓存清除，重新走 loading 加载
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

// 将查询缓存持久化到 localStorage，实现跨浏览器会话的数据保留
const persister = createAsyncStoragePersister({
  storage: window.localStorage,
});

export default function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <AppRouter />
    </PersistQueryClientProvider>
  );
}
