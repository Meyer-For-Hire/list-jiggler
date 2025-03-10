import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { encoded: string } }): Promise<Metadata> {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/list/${params.encoded}`;
  
  return {
    alternates: {
      types: {
        'application/json+oembed': `/api/oembed?url=${encodeURIComponent(url)}`
      }
    }
  };
}

export default function ListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 