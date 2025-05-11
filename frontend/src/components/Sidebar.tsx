import React from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Toolbar, Divider, ListItemButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Главная', icon: <DashboardIcon />, link: '/' },
  { text: 'Статьи', icon: <ArticleIcon /> },
  { text: 'Пользователи', icon: <PeopleIcon /> },
  { text: 'Техника', icon: <DevicesIcon />, link: '/equipment' },
  { text: 'Акты', icon: <AssignmentIcon /> },
  { text: 'Система', icon: <SettingsIcon /> },
  { text: 'Помощь', icon: <HelpIcon /> },
];

const Sidebar: React.FC = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#1a2332', color: '#fff' },
    }}
  >
    <Toolbar sx={{ minHeight: 64, bgcolor: '#22304a', color: '#fff', fontWeight: 700, fontSize: 20, justifyContent: 'center' }}>
      AMS IT System
    </Toolbar>
    <Divider />
    <List>
      {menuItems.map((item) => (
        <ListItemButton key={item.text} component={item.link ? Link : 'div'} to={item.link || undefined}>
          <ListItemIcon sx={{ color: '#90caf9' }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.text} />
        </ListItemButton>
      ))}
    </List>
  </Drawer>
);

export default Sidebar; 