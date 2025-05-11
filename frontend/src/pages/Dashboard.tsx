import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import Grid from '@mui/material/Grid';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';

const articles = [
  { title: 'About', hits: 0, date: '2021-11-14' },
  { title: 'About your home page', hits: 0, date: '2021-11-14' },
  { title: 'Welcome to your blog', hits: 0, date: '2021-11-14' },
  { title: 'Typography', hits: 0, date: '2021-11-14' },
  { title: 'New feature: Workflows', hits: 0, date: '2021-11-14' },
];

const recentArticles = [
  { title: 'About', author: 'TestJ4', date: '2021-11-14' },
  { title: 'Your Template', author: 'TestJ4', date: '2021-11-14' },
  { title: 'Your Modules', author: 'TestJ4', date: '2021-11-14' },
  { title: 'About your home page', author: 'TestJ4', date: '2021-11-14' },
  { title: 'Welcome to your blog', author: 'TestJ4', date: '2021-11-14' },
];

const Dashboard: React.FC = () => {
  const [counts, setCounts] = useState({ users: 0, equipment: 0 });

  useEffect(() => {
    fetch('/api/dashboard/counts')
      .then(res => res.json())
      .then(data => setCounts(data));
  }, []);

  return (
    <Box>
      <Grid container spacing={2} mb={2} columns={12}>
        <Grid component="div" sx={{ gridColumn: 'span 4' }}>
          <Card sx={{ bgcolor: '#2e7d32', color: '#fff' }}>
            <CardContent>
              <Typography variant="h4">{counts.equipment}</Typography>
              <Typography>Equipment</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 4' }}>
          <Card sx={{ bgcolor: '#0288d1', color: '#fff' }}>
            <CardContent>
              <Typography variant="h4">{counts.users}</Typography>
              <Typography>Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 4' }}>
          <Card sx={{ bgcolor: '#f9a825', color: '#fff' }}>
            <CardContent>
              <Typography variant="h6">System Info</Typography>
              <Typography variant="body2">MySQL, Node.js, React</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2} columns={12}>
        <Grid component="div" sx={{ gridColumn: 'span 6' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Popular Articles</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Hits</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((a) => (
                  <TableRow key={a.title}>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.hits}</TableCell>
                    <TableCell>{a.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 6' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recently Added Articles</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentArticles.map((a) => (
                  <TableRow key={a.title}>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>{a.author}</TableCell>
                    <TableCell>{a.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="h6" mb={1}>Components</Typography>
      <Grid container spacing={2} columns={12}>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>Akeeba Backup</Typography>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>Banners</Typography>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>Contacts</Typography>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>News Feeds</Typography>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <WarningIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>Smart Search</Typography>
          </Paper>
        </Grid>
        <Grid component="div" sx={{ gridColumn: 'span 2' }}>
          <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
            <ArticleIcon sx={{ fontSize: 40, color: '#8e24aa' }} />
            <Typography>Tags</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 