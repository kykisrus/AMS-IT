import React from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Toolbar, Divider, ListItemButton, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import ApiIcon from '@mui/icons-material/Api';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  link?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Главная', icon: <DashboardIcon />, link: '/' },
  { text: 'Сотрудники', icon: <PeopleIcon />, link: '/employees' },
  { text: 'Техника', icon: <DevicesIcon />, link: '/equipment' },
  { text: 'Акты', icon: <AssignmentIcon />, link: '/acts' },
  { 
    text: 'Система', 
    icon: <SettingsIcon />, 
    subItems: [
      { text: 'Пользователи', icon: <PeopleIcon />, link: '/users' },
      { text: 'Настройки', icon: <SettingsIcon />, link: '/settings' },
      { text: 'Интеграции', icon: <ApiIcon />, link: '/system/integration' },
    ]
  },
];

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({
    'Система': true
  });

  const handleClick = (text: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          background: '#1a2332', 
          color: '#fff' 
        },
      }}
    >
      <Toolbar sx={{ 
        minHeight: 64, 
        bgcolor: '#22304a', 
        color: '#fff', 
        fontWeight: 700, 
        fontSize: 20, 
        justifyContent: 'center' 
      }}>
        AMS IT System
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              <>
                <ListItemButton onClick={() => handleClick(item.text)}>
                  <ListItemIcon sx={{ color: '#90caf9' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        component={Link}
                        to={subItem.link || '#'}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon sx={{ color: '#90caf9' }}>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItemButton 
                component={Link} 
                to={item.link || '#'}
              >
                <ListItemIcon sx={{ color: '#90caf9' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar; 