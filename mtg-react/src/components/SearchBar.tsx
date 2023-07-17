import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { buttonBackgroundStyle, searchBarListItemStyle, searchTextFieldStyle } from '../style/styles';
import { CardMedia, Checkbox, Divider, MenuItem, Select } from '@mui/material';
import { Color, MTGSetDTO } from '../../../mtg-common/src/DTO';
import { searchBarDrawerWidth } from '../constants';
import { DeckFormat } from "../enum";
import { CardQueryParameters } from '../../../mtg-common/dist/requests';
import { firstCharUpper } from '../functions/util';

export interface SearchWindowProps {
  selectedQueryParameters: CardQueryParameters,
  handleChangeSelectedQueryParameters: any,
  sets: MTGSetDTO[];
  rarities: string[];
  types: string[];
  typeSearchSettings: string[];
  colors: Color[];
  colorSearchSettings: string[];
}

export default function SearchBar(props: SearchWindowProps) {
  const formats: DeckFormat[] = [DeckFormat.STANDARD, DeckFormat.COMMANDER]

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
            name="cardName"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedQueryParameters}
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
            name="cardText"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedQueryParameters}
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
            name="sets"
            labelId="search-set-label"
            id="search-set"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.sets}
            renderValue={
              (selected) => props.selectedQueryParameters.sets.map(
                setId => props.sets.filter(set => setId == set.id).map(set => set.fullName))
                .join(", ")
            }
            onChange={props.handleChangeSelectedQueryParameters}
            multiple
          >
            <MenuItem value={99999}>
              <ListItemIcon>
                <Checkbox
                  checked={props.selectedQueryParameters.sets.length > 0 && props.selectedQueryParameters.sets.length === props.selectedQueryParameters.sets.length}
                  indeterminate={props.selectedQueryParameters.sets.length > 0 && props.selectedQueryParameters.sets.length < props.selectedQueryParameters.sets.length}
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
                  checked={props.selectedQueryParameters.sets.indexOf(set.id) > -1} />
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
            name="rarities"
            labelId="search-rarity-label"
            id="search-rarity"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.rarities}
            onChange={props.handleChangeSelectedQueryParameters}
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
                  checked={props.selectedQueryParameters.rarities.indexOf(rarity) > -1} />
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
            name="typeSearchSetting"
            labelId="search-type-settinglabel"
            id="search-type-setting"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.typeSearchSetting}
            onChange={props.handleChangeSelectedQueryParameters}
          >
            {props.typeSearchSettings.map((setting) => (
              <MenuItem key={setting} value={setting}>
                <ListItemText primary={setting} />
              </MenuItem>
            ))}
          </Select>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <Select
            labelId="search-type-label"
            id="search-type"
            name="types"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}

            value={props.selectedQueryParameters.types}
            onChange={props.handleChangeSelectedQueryParameters}
            multiple
            renderValue={(selected) => selected.join(', ')}
          >
            {props.types.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={props.selectedQueryParameters.types.indexOf(type) > -1} />
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
            name="subType"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedQueryParameters}
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
            name="colorSearchSetting"
            labelId="search-color-settinglabel"
            id="search-color-setting"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.colorSearchSetting}
            onChange={props.handleChangeSelectedQueryParameters}
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
            name="colors"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.colors}
            onChange={props.handleChangeSelectedQueryParameters}
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
                  checked={props.selectedQueryParameters.colors.indexOf(color.name) > -1} />
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
            name="manaCost"
            defaultValue=""
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedQueryParameters}
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
            name="format"
            labelId="search-format-label"
            id="search-format"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            value={props.selectedQueryParameters.format.toString()}
            // renderValue={props.selectedDeckFormat.toString()}
            onChange={props.handleChangeSelectedQueryParameters}>
            {formats.map((format) => (
              <MenuItem key={format.toString()} value={format.toString()}>
                <ListItemText
                  primary={firstCharUpper(format)}
                />
              </MenuItem>
            ))}
            </Select>
        </ListItem>

        <ListItem sx={{ ...searchBarListItemStyle }}>
          <ListItemText>Owned copies</ListItemText>
        </ListItem>
        <ListItem sx={{ ...searchBarListItemStyle }}>
          <TextField
            name="minOwnedCopies"
            type="number"
            defaultValue={0}
            variant="standard"
            style={searchTextFieldStyle}
            sx={{ ...buttonBackgroundStyle }}
            onChange={props.handleChangeSelectedQueryParameters}
            InputProps={{
              inputProps: {
                style: { textAlign: "center" },
              }
            }} />
        </ListItem>

        <Divider />

      </List>
    </Drawer>
  );
}
