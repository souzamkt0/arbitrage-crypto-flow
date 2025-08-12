import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const NEWSDATA_API_KEY = 'pub_7d30bec4ab0045e59c9fc2e3836551ad'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL('https://newsdata.io/api/1/news')
    url.searchParams.set('apikey', NEWSDATA_API_KEY)
    url.searchParams.set('q', 'financial markets OR crypto OR bitcoin OR ethereum OR trading OR stock market')
    url.searchParams.set('language', 'pt,en')
    url.searchParams.set('country', 'br,us')
    url.searchParams.set('category', 'business,technology')
    url.searchParams.set('size', '10')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`NewsData API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Format the news data for our frontend
    const formattedNews = data.results?.map((article: any) => ({
      title: article.title,
      source: article.source_id || 'NewsData',
      time: new Date(article.pubDate).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      sentiment: article.sentiment || 'neutral',
      url: article.link,
      description: article.description
    })) || []

    return new Response(
      JSON.stringify({ news: formattedNews }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error fetching news:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch news' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})