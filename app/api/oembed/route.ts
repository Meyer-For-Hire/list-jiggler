import { NextRequest, NextResponse } from 'next/server';
import { decodeUrlSafeBase64 } from '@/app/utils/encoding';

interface ListData {
  title: string;
  items: string[];
}

export async function GET(request: NextRequest) {
  // Check if this is a direct Slackbot request to a list page
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.nextUrl.searchParams.get('url') || '';
  const isSlackbot = userAgent.startsWith('Slackbot-LinkExpanding');
  
  let listUrl = url;
  
  // If this is a direct Slackbot request to a list page, extract the URL
  if (isSlackbot && !url && request.nextUrl.pathname.startsWith('/list/')) {
    listUrl = request.nextUrl.href;
  }
  
  if (!listUrl) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // Extract encoded data from URL
    const encoded = listUrl.split('/list/')[1];
    if (!encoded) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Decode and parse list data
    const decoded = decodeUrlSafeBase64(encoded);
    const data = JSON.parse(decoded) as ListData;

    // Create HTML representation of the list
    const listHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; padding: 16px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">${data.title}</h3>
        <ol style="margin: 0; padding-left: 24px;">
          ${data.items.map(item => 
            `<li style="margin: 4px 0; font-size: 14px;">${item}</li>`
          ).join('')}
        </ol>
      </div>
    `.trim();

    // Calculate approximate height based on number of items
    const approximateHeight = 60 + (data.items.length * 24);

    return NextResponse.json({
      type: 'rich',
      version: '1.0',
      title: data.title,
      provider_name: 'List Jiggler',
      provider_url: 'https://listjiggler.com',
      width: 400,
      height: approximateHeight,
      html: listHtml
    });
  } catch (error) {
    console.error('Error processing oEmbed request:', error);
    return NextResponse.json({ error: 'Failed to process list data' }, { status: 400 });
  }
} 