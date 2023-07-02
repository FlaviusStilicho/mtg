import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { IconButton, Toolbar, Typography } from '@mui/material';

import { navBarHeight } from '../constants';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

export interface NavBarProps {
  selectedTab: number
  handleChangeSelectedTab: (event: React.SyntheticEvent, newValue: number) => void
  open: boolean
  handleDeckManagerOpenClose: any
}

export default function NavBar(props: NavBarProps) {
  return (
    <AppBar component="div" position="sticky" elevation={0} sx={{ zIndex: 0, width: "100%", height: navBarHeight }}>
      <Toolbar>
        <Tabs value={props.selectedTab} textColor="inherit" onChange={props.handleChangeSelectedTab}>
          <Tab label="Collection" />
          <Tab label="Decks" />
        </Tabs>
        {props.selectedTab === 1 &&
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={props.handleDeckManagerOpenClose}
            sx={{
              marginLeft: 'auto',
              // ...(props.open && { display: 'none' }) 
            }}
          >
            <MenuOpenIcon />
            <Typography sx={{ padding: 1}}>Deck Manager</Typography>
          </IconButton>
        }
      </Toolbar>
    </AppBar>
  );
}
