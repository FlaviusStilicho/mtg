import { Box, Button, IconButton, TextField } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { cardTextFieldStyle, flipButtonStyle, staticButtonStyle } from '../../style/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CardState } from '../hooks/CardState';

const MTGCardCollectionCounterBox: React.FC<CardState> = (cardState) => {

    return (
        <Box style={{alignItems: "center"}}>
            <Button
                aria-label="reduce"
                name="subtract-button"
                variant="contained"
                style={staticButtonStyle}
                sx={{ borderRadius: '20%' }}
                onClick={cardState.subtractOwnedCopy}>
                <RemoveIcon fontSize="small" />
            </Button>
            <TextField
                name="current-copies-counter"
                value={cardState.ownedCopies}
                variant="standard"
                style={cardTextFieldStyle}
                sx={{ borderRadius: '20%' }}
                InputProps={{
                    readOnly: true,
                    disabled: true,
                    inputProps: {
                        style: { textAlign: "center" },
                    }
                }}></TextField>
            <Button
                aria-label="increase"
                name="add-button"
                variant="contained"
                style={staticButtonStyle}
                onClick={cardState.addOwnedCopy}>
                <AddIcon fontSize="small" />
            </Button>

            {cardState.primaryVersion.backImageUri !== null &&
                <IconButton
                    name="flip-button"
                    style={flipButtonStyle}
                    onClick={cardState.flipCard}>
                    <AutorenewIcon />
                </IconButton>
            }
        </Box>
    )
}

export default MTGCardCollectionCounterBox