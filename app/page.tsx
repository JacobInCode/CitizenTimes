import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import ConnectSupabaseSteps from "@/components/tutorial/ConnectSupabaseSteps";
import SignUpUserSteps from "@/components/tutorial/SignUpUserSteps";
import Header from "@/components/Header";
import { createBrowserClient } from '@supabase/ssr'
import ArticlesFeed from "@/components/ArticlesFeed";

function shouldGenerate(lastGeneration: any): boolean {
  let generate = false;
  if (lastGeneration) {
    const createdAt = new Date(lastGeneration.created_at);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours > 24) {
      generate = true;
    }
  } else {
    generate = true;
  }
  return generate;
}


export default async function Index() {
  const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')
  let channelId = "ethereum";
  let articles = null;

  try {
    const { data: lastGeneration, error: generationError } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();


    console.log("lastGeneration", lastGeneration);

    if (generationError) {
      console.error(generationError);
    }

    if (!shouldGenerate(lastGeneration)) {
      const { data: latestArticles, error: articlesError } = await supabaseAdmin
        .from('articles')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (articlesError) {
        console.error(articlesError);
      }

      articles = latestArticles;
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center mt-56 mb-32">
      <ArticlesFeed articles={articles} />
    </div>
  );
}
