import Box from '@mui/material/Box';
import { MenuItem } from '@mui/material';
import { DeckDTO } from 'mtg-common';
import { getCommander, getDeckColorIdentity } from '../../functions/util';
import ColorIcon from '../ColorIcon';
import { deckNameFontSize } from './DeckManagerDrawer';

export function renderDeckName(deck: DeckDTO) {
  const commander = getCommander(deck);
  var deckColorIdentity = getDeckColorIdentity(deck);
  return (
    <MenuItem key={`${deck.id}-${Date.now()}`} value={deck.id}>
      <Box sx={{ fontSize: deckNameFontSize, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {commander ? `${deck.name} [${commander.name}]` : deck.name}
        <Box>
          {Array.from(deckColorIdentity).map((color) => (
            <ColorIcon color={`${color}DN`}/>
          ))}
        </Box>
      </Box>
    </MenuItem>
  );
}
