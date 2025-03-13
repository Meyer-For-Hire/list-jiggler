'use client';

import { useState } from 'react';
import {
  Container,
  Stack,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import { decodeUrlSafeBase64, encodeUrlSafeBase64 } from '../utils/encoding';
import { findOptimalRanking, validateRankings } from '../utils/rbo';
import Footer from '../components/Footer';
import { useRouter } from 'next/navigation';

interface ListData {
  title: string;
  items: string[];
}

interface RankingData {
  item: string;
  rankings: number[];
  rboRank: number;
}

function extractListFromUrl(url: string): { title: string; items: string[] } | null {
  try {
    const encoded = url.split('/list/')[1];
    if (!encoded) return null;
    
    const decoded = decodeUrlSafeBase64(encoded);
    const data = JSON.parse(decoded) as ListData;
    return { title: data.title, items: data.items };
  } catch (e) {
    return null;
  }
}

export default function Compare() {
  const [urls, setUrls] = useState('');
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getNewListTitle = () => {
    const urlList = urls.split(/\r?\n/).filter(url => url.trim());
    const lists = urlList.map(url => extractListFromUrl(url)).filter((l): l is { title: string; items: string[] } => l !== null);
    
    // Check if all titles match
    const firstTitle = lists[0].title;
    const allTitlesMatch = lists.every(list => list.title === firstTitle);
    
    // Set title based on whether all titles match
    return allTitlesMatch 
      ? `${firstTitle} (combined rank)`
      : 'Combined Ranked List';
  };

  const formatDate = () => {
    const now = new Date();
    return now.getFullYear() +
           String(now.getMonth() + 1).padStart(2, '0') +
           String(now.getDate()).padStart(2, '0') + '.' +
           String(now.getHours()).padStart(2, '0') +
           String(now.getMinutes()).padStart(2, '0') +
           String(now.getSeconds()).padStart(2, '0');
  };

  const handleCompare = () => {
    const urlList = urls.split(/\r?\n/).filter(url => url.trim());
    if (urlList.length < 2) {
      setError('Please provide at least two URLs to compare');
      return;
    }

    // Extract rankings from URLs
    const extractedRankings = urlList.map(url => extractListFromUrl(url));
    if (extractedRankings.some(r => r === null)) {
      setError('One or more URLs are invalid or cannot be decoded');
      return;
    }

    const validRankings = extractedRankings.filter((r): r is { title: string; items: string[] } => r !== null);
    if (!validateRankings(validRankings.map(r => r.items))) {
      setError('The lists contain different items or are of different lengths');
      return;
    }

    // Calculate optimal ranking using RBO
    const optimalRanking = findOptimalRanking(validRankings.map(r => r.items));

    // Prepare data for the table
    const rankingData: RankingData[] = optimalRanking.map(item => {
      const rankings = validRankings.map(ranking => ranking.items.indexOf(item) + 1);
      const rboRank = optimalRanking.indexOf(item) + 1;
      return { item, rankings, rboRank };
    });

    setRankings(rankingData);
    setError(null);
  };

  const handleDownloadCsv = () => {
    if (rankings.length === 0) return;

    const headers = ['Item', 'RBO Rank', 'Rankings'];
    const rows = rankings.map(r => [
      r.item,
      r.rboRank.toString(),
      r.rankings.join(', ')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => 
        cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const title = getNewListTitle();
    link.download = `${title}.${formatDate()}.csv`;
    link.click();
  };

  const handleCreateNewList = () => {
    if (rankings.length > 0) {
      // Sort the items by their RBO rank
      const sortedItems = rankings
        .sort((a, b) => a.rboRank - b.rboRank)
        .map(r => r.item);
      
      const newListData = {
        title: getNewListTitle(),
        items: sortedItems
      };

      const encodedList = encodeUrlSafeBase64(JSON.stringify(newListData));
      const url = `${window.location.origin}/list/${encodedList}`;
      window.open(url, '_blank');
    }
  };

  return (
    <Container maxWidth="md">
      <Stack spacing={4} sx={{ minHeight: '100vh', py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Compare Rankings
        </Typography>

        <TextField
          label="List URLs, one per line"
          multiline
          rows={4}
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Paste one URL per line"
          fullWidth
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCompare}
            disabled={!urls.trim()}
          >
            Compare Rankings
          </Button>
          {rankings.length > 0 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleDownloadCsv}
            >
              Download CSV
            </Button>
          )}
          {rankings.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateNewList}
            >
              Open as New List
            </Button>
          )}
        </Stack>

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        {rankings.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>RBO Rank</TableCell>
                  <TableCell>Rankings</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rankings.map((row) => (
                  <TableRow key={row.item}>
                    <TableCell>{row.item}</TableCell>
                    <TableCell>{row.rboRank}</TableCell>
                    <TableCell>{row.rankings.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <div style={{ flexGrow: 1 }} />
        <Footer variant="page" />
      </Stack>
    </Container>
  );
} 