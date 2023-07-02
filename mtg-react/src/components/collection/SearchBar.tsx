import React from "react";
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { buttonBackgroundStyle, searchBarListItemStyle, searchTextFieldStyle } from '../../style/styles';
import { CardMedia, Checkbox, Divider, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { Color, MTGSetDTO } from '../../../../mtg-common/src/DTO';
import { searchBarDrawerWidth } from '../../constants';
import { DeckFormat } from "../../enum";

export interface SearchWindowProps {
  cardNameQuery: string;
  handleChangeCardNameQuery: any;
  cardTextQuery: string;
  handleChangeCardTextQuery: any;
  sets: MTGSetDTO[];
  selectedSets: number[];
  setSelectedSets: React.Dispatch<React.SetStateAction<number[]>>;
  handleChangeSelectedSets: (event: SelectChangeEvent<number[]>) => void;
  rarities: string[];
  selectedRarities: string[];
  setSelectedRarities: React.Dispatch<React.SetStateAction<string[]>>;
  handleChangeSelectedRarities: (event: SelectChangeEvent<string[]>) => void;
  types: string[];
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  handleChangeSelectedTypes: (event: SelectChangeEvent<string[]>) => void;
  selectedSubType: string;
  setSelectedSubType: React.Dispatch<React.SetStateAction<string>>;
  handleChangeSelectedSubType: any;
  colors: Color[];
  selectedColors: string[];
  setSelectedColors: React.Dispatch<React.SetStateAction<string[]>>;
  handleChangeSelectedColors: (event: SelectChangeEvent<string[]>) => void;
  colorSearchSettings: string[];
  setColorSearchSetting: React.Dispatch<React.SetStateAction<string[]>>;
  selectedColorSearchSetting: string;
  setSelectedColorSearchSetting: React.Dispatch<React.SetStateAction<string>>;
  handleChangeSelectedColorSearchSetting: (event: SelectChangeEvent<string>) => void;
  selectedManaCost: string;
  setSelectedManaCost: React.Dispatch<React.SetStateAction<string>>;
  handleChangeSelectedManaCost: any;
  selectedDeckFormat: DeckFormat;
  setSelectedDeckFormat: React.Dispatch<React.SetStateAction<DeckFormat>>;
  handleChangeSelectedDeckFormat: any;
}

export default function SearchBar(props: SearchWindowProps) {
  return (
    <Drawer
      variant="permanent"
      PaperProps={{ style: { width: searchBarDrawerWidth } }}
    >
      <List disablePadding>
        <ListItem sx={{ py: 1.5, fontSize: 18, color: '#fff' }}>
          <Box style={{ paddingRight: 10, borderRadius: "20px" }}>
            <CardMedia
              style={{
                padding: 30,
                borderRadius: '25%',
              }}
              image="/magic_icon.jpeg"
            />
          </Box>
          Collection Manager
        </ListItem>

        <ListItem sx={{ ...searchBarListItemStyle, py: 1.5, }}>
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText>Search for cards</ListItemText>
        </ListItem>


        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Card Name</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <TextField
            name="search-card-name"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeCardNameQuery}
            InputProps={{
              inputProps: {
                style: { textAlign: "center" },
              }
            }} />
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Card Text</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <TextField
            name="search-card-name"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeCardTextQuery}
            InputProps={{
              inputProps: {
                style: { textAlign: "center" },
              }
            }} />
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Set</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-set-label"
            id="search-set"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedSets}
            renderValue={
              (selected) => props.selectedSets.map(
                setId => props.sets.filter(set => setId == set.id).map(set => set.fullName))
                .join(", ")
            }
            onChange={props.handleChangeSelectedSets}
            multiple
          >
            <MenuItem value={99999}>
              <ListItemIcon>
                <Checkbox
                  checked={props.selectedSets.length > 0 && props.selectedSets.length === props.selectedSets.length}
                  indeterminate={props.selectedSets.length > 0 && props.selectedSets.length < props.selectedSets.length}
                />
              </ListItemIcon>
              <ListItemText
                primary="Select All"
                disableTypography
                sx={{
                  mx: 0.3,
                  fontSize: 11,
                }} />
            </MenuItem>
            {props.sets.map((set) => (
              <MenuItem key={set.id} value={set.id}>
                <Checkbox
                  checked={props.selectedSets.indexOf(set.id) > -1} />
                <ListItemText
                  primary={set.fullName}
                  disableTypography
                  sx={{
                    mx: 0.3,
                    fontSize: 11,
                  }}
                />
              </MenuItem>
            ))
            }
          </Select>
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Rarity</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-rarity-label"
            id="search-rarity"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedRarities}
            onChange={props.handleChangeSelectedRarities}
            multiple
            renderValue={(selected) =>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((rarity) => (
                  <Box
                    component="img"
                    key={rarity}
                    sx={{
                      height: 25,
                      width: 25,
                      maxHeight: { xs: 25, md: 25 },
                      maxWidth: { xs: 25, md: 25 },
                    }}
                    style={{
                      borderRadius: "10px"
                    }}
                    src={`http://localhost:3000/${rarity}.png`}
                  />))}
              </Box>
            }
          >
            {props.rarities.map((rarity) => (
              <MenuItem key={rarity} value={rarity}>
                <Checkbox
                  checked={props.selectedRarities.indexOf(rarity) > -1} />
                <Box
                  component="img"
                  sx={{
                    height: 25,
                    width: 25,
                    maxHeight: { xs: 25, md: 25 },
                    maxWidth: { xs: 25, md: 25 },
                  }}
                  style={{
                    borderRadius: "10px"
                  }}
                  src={`http://localhost:3000/${rarity}.png`}
                />
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Type</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-type-label"
            id="search-type"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}

            value={props.selectedTypes}
            onChange={props.handleChangeSelectedTypes}
            multiple
            renderValue={(selected) => selected.join(', ')}
          >
            {props.types.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={props.selectedTypes.indexOf(type) > -1} />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Subtype</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <TextField
            name="search-subtype"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedSubType}
            InputProps={{
              inputProps: {
                style: { textAlign: "center" },
              }
            }} />
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Color</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-color-settinglabel"
            id="search-color-setting"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedColorSearchSetting}
            onChange={props.handleChangeSelectedColorSearchSetting}
          >
            {props.colorSearchSettings.map((setting) => (
              <MenuItem key={setting} value={setting}>
                <ListItemText primary={setting} />
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-color-label"
            id="search-color"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}

            value={props.selectedColors}
            onChange={props.handleChangeSelectedColors}
            multiple
            label="Any"
            renderValue={(selected) =>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((color) => (
                  <Box
                    component="img"
                    key={color}
                    sx={{
                      height: 25,
                      width: 25,
                      maxHeight: { xs: 25, md: 25 },
                      maxWidth: { xs: 25, md: 25 },
                    }}
                    src={`http://localhost:3000/mana/${color}.png`}
                  />))}
              </Box>
            }
          >
            {props.colors.map((color) => (
              <MenuItem key={color.name} value={color.name}>
                <Checkbox
                  checked={props.selectedColors.indexOf(color.name) > -1} />
                <Box
                  component="img"
                  sx={{
                    height: 25,
                    width: 25,
                    maxHeight: { xs: 25, md: 25 },
                    maxWidth: { xs: 25, md: 25 },
                  }}
                  src={`http://localhost:3000/mana/${color.iconUrl}`}
                />
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <Divider />

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Mana cost</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <TextField
            name="search-mana-cost"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedManaCost}
            InputProps={{
              inputProps: {
                style: { textAlign: "center" },
              }
            }} />
        </ListItem>

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Format</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-format-label"
            id="search-format"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedDeckFormat.toString()}
            // renderValue={props.selectedDeckFormat.toString()}
            onChange={props.handleChangeSelectedDeckFormat}
          />
        </ListItem>

        <Divider />

      </List>
    </Drawer>
  );
}
