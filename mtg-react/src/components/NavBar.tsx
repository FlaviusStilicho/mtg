import AppBar from '@mui/material/AppBar';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { IconButton, Toolbar, Typography } from '@mui/material';

import { navBarHeight } from '../constants';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { SyntheticEvent } from 'react';

export interface NavBarProps {
  selectedTab: number
  handleChangeSelectedTab: (event: SyntheticEvent, newValue: number) => void
  open: boolean
  handleDeckManagerOpenClose:  () => void
  handleWishlistOpenClose: () => void
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
            aria-label="open deck manager"
            edge="end"
            onClick={props.handleDeckManagerOpenClose}
            sx={{
              marginLeft: 'auto',
            }}
          >
            <MenuOpenIcon />
            <Typography sx={{ padding: 1}}>Deck Manager</Typography>
          </IconButton>
        }
        {props.selectedTab === 0 &&
          <IconButton
            color="inherit"
            aria-label="open wishlist"
            edge="end"
            onClick={props.handleWishlistOpenClose}
            sx={{
              marginLeft: 'auto',
            }}
          >
            <MenuOpenIcon />
            <Typography sx={{ paddingRight: 3, paddingLeft: 1}}>Wishlist</Typography>
          </IconButton>
        }
      </Toolbar>
    </AppBar>
  );
}
