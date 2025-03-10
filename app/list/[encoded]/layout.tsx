import { Metadata } from 'next';
import { decodeUrlSafeBase64 } from '@/app/utils/encoding';

interface ListData {
  title: string;
  items: string[];
}

export async function generateMetadata({ params }: { params: { encoded: string } }): Promise<Metadata> {
  try {
    // Decode the list data
    const decoded = decodeUrlSafeBase64(params.encoded);
    const data = JSON.parse(decoded) as ListData;
    
    // Create a preview of the list items (first 5 items)
    const previewItems = data.items.slice(0, 5);
    const hasMore = data.items.length > 5;
    const description = previewItems.map((item, index) => `${index + 1}. ${item}`).join('\n') + 
      (hasMore ? '\n...' : '');
    
    return {
      title: data.title,
      description: `A ranked list with ${data.items.length} items`,
      openGraph: {
        title: data.title,
        description: description,
        type: 'website',
        siteName: 'List Jiggler',
      },
      twitter: {
        card: 'summary_large_image',
        title: data.title,
        description: description,
      }
    };
  } catch (error) {
    // Fallback metadata if decoding fails
    return {
      title: 'List Jiggler',
      description: 'Create and share sortable lists'
    };
  }
}

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 