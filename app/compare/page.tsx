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
import { decodeUrlSafeBase64 } from '../utils/encoding';
import { findOptimalRanking, validateRankings } from '../utils/rbo';
import Footer from '../components/Footer';

interface ListData {
  title: string;
  items: string[];
}

interface RankingData {
  item: string;
  rankings: number[];
  rboRank: number;
}

function extractListFromUrl(url: string): string[] | null {
  try {
    const encoded = url.split('/list/')[1];
    if (!encoded) return null;
    
    const decoded = decodeUrlSafeBase64(encoded);
    const data = JSON.parse(decoded) as ListData;
    return data.items;
  } catch (e) {
    return null;
  }
}

export default function Compare() {
  const [urls, setUrls] = useState('');
  const [rankings, setRankings] = useState<RankingData[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    const validRankings = extractedRankings.filter((r): r is string[] => r !== null);
    if (!validateRankings(validRankings)) {
      setError('The lists contain different items or are of different lengths');
      return;
    }

    // Calculate optimal ranking using RBO
    const optimalRanking = findOptimalRanking(validRankings);

    // Prepare data for the table
    const rankingData: RankingData[] = optimalRanking.map(item => {
      const rankings = validRankings.map(ranking => ranking.indexOf(item) + 1);
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
    link.download = 'rankings.csv';
    link.click();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Stack spacing={4} sx={{ minHeight: '100vh' }}>
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