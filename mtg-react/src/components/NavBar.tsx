import AppBar from "@mui/material/AppBar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { IconButton, Toolbar, Typography } from "@mui/material";

import { navBarHeight } from "../constants";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { SyntheticEvent } from "react";
import {
  UploadCollectionWindow,
  UploadCollectionWindowProps,
} from "./decks/windows/UploadCollectionWindow";

export interface NavBarProps {
  selectedTab: number;
  handleChangeSelectedTab: (event: SyntheticEvent, newValue: number) => void;
  open: boolean;
  collectionUploadWindowOpened: boolean;
  handleCollectionUploadWindowOpenClose: () => void;
  handleDeckManagerOpenClose: () => void;
  handleWishlistOpenClose: () => void;
  openInfoSnackbar: (message: string) => void;
  openErrorSnackbar: (message: string) => void;
}

export default function NavBar(props: NavBarProps) {
  const uploadCollectionWindowProps: UploadCollectionWindowProps = {
    opened: props.collectionUploadWindowOpened,
    onClose: props.handleCollectionUploadWindowOpenClose,
    openInfoSnackbar: props.openInfoSnackbar,
    openErrorSnackbar: props.openErrorSnackbar,
  };

  return (
    <AppBar
      component="div"
      position="sticky"
      elevation={0}
      sx={{ zIndex: 0, width: "100%", height: navBarHeight }}
    >
      <Toolbar>
        <Tabs
          value={props.selectedTab}
          textColor="inherit"
          onChange={props.handleChangeSelectedTab}
        >
          <Tab label="Collection" />
          <Tab label="Deck Editor" />
          <Tab label="Deck Overview" />
        </Tabs>
        <IconButton
          color="inherit"
          aria-label="open collection upload window"
          edge="end"
          onClick={props.handleCollectionUploadWindowOpenClose}
          sx={{
            marginLeft: "auto",
          }}
        >
          <UploadFileIcon />
          <Typography sx={{ padding: 1 }}>Upload collection</Typography>
        </IconButton>
        {props.selectedTab === 0 && (
          <IconButton
            color="inherit"
            aria-label="open wishlist"
            edge="end"
            onClick={props.handleWishlistOpenClose}
          >
            <MenuOpenIcon />
            <Typography sx={{ paddingRight: 3, paddingLeft: 1 }}>
              Wishlist
            </Typography>
          </IconButton>
        )}
        {props.selectedTab === 1 && (
          <IconButton
            color="inherit"
            aria-label="open deck manager"
            edge="end"
            onClick={props.handleDeckManagerOpenClose}
          >
            <MenuOpenIcon />
            <Typography sx={{ padding: 1 }}>Deck Manager</Typography>
          </IconButton>
        )}
        <UploadCollectionWindow {...uploadCollectionWindowProps} />
      </Toolbar>
    </AppBar>
  );
}
