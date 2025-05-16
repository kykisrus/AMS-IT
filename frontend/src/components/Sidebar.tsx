import React from 'react';
import { Drawer, List, ListItemIcon, ListItemText, Toolbar, Divider, ListItemButton, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import ApiIcon from '@mui/icons-material/Api';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  link?: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Дашборд', icon: <DashboardIcon />, link: '/dashboard' },
  { text: 'Сотрудники', icon: <PeopleIcon />, link: '/employees' },
  { text: 'Техника', icon: <DevicesIcon />, link: '/equipment' },
  { text: 'Акты', icon: <AssignmentIcon />, link: '/acts' },
  {
    text: 'Система',
    icon: <SettingsIcon />,
    subItems: [
      { text: 'Организации', icon: <SettingsIcon />, link: '/organizations' },
      { text: 'Пользователи', icon: <PeopleIcon />, link: '/users' },
      { text: 'Роли', icon: <SecurityIcon />, link: '/roles' },
      { text: 'Настройки', icon: <SettingsIcon />, link: '/settings' },
      { text: 'Интеграции', icon: <ApiIcon />, link: '/system/integration' },
      { text: 'Импорт данных', icon: <UploadFileIcon />, link: '/system/import' },
    ],
  },
];

const Sidebar: React.FC = () => {
  const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem('openMenus');
    return saved ? JSON.parse(saved) : { 'Система': true };
  });
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (text: string) => {
    setOpenMenus(prev => {
      const newState = {
        ...prev,
        [text]: !prev[text]
      };
      localStorage.setItem('openMenus', JSON.stringify(newState));
      return newState;
    });
  };

  const isActive = (link?: string) => {
    if (!link) return false;
    return location.pathname === link;
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
          color: '#fff',
        },
      }}
    >
      <Toolbar sx={{
        minHeight: 64,
        bgcolor: '#22304a',
        color: '#fff',
        fontWeight: 700,
        fontSize: 20,
        justifyContent: 'center',
      }}>
        AMS IT System
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              <>
                <ListItemButton onClick={() => handleClick(item.text)} selected={openMenus[item.text]}>
                  <ListItemIcon sx={{ color: '#90caf9' }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {openMenus[item.text] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={openMenus[item.text]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        sx={{ pl: 4 }}
                        selected={isActive(subItem.link)}
                        onClick={() => subItem.link && navigate(subItem.link)}
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
                selected={isActive(item.link)}
                onClick={() => item.link && navigate(item.link)}
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