
import { initialFetch } from '@/lib/utils/fetch';
import ArticlesFeed from "@/components/ArticlesFeed";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 15 // revalidate at most every hour

export default async function Index({ params }: { params: { id: string } }) {
  let channelId = params.id || 'all';
  const { prices, articles } = await initialFetch(channelId);

  return (
    <div className="flex-1 w-full flex flex-col gap-7 items-center mb-16 relative max-w-6xl">
      <Header prices={prices} channelId={channelId} />
      <ArticlesFeed articles={articles} />
      <Footer />
    </div>
  );
}
