import { Alert, Button, Dialog, List, ListItem, ListItemText, MenuItem, Snackbar, TextField } from "@mui/material";
import { DeckDTO } from "mtg-common";
import axios from "axios";
import { memo, useState } from "react";
import { firstCharUpper } from "../../../functions/util";

export interface EditDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    deck: DeckDTO;
    fetchDecks: any;
}

export const EditDeckWindow = memo((props: EditDeckWindowProps) => {
    const [newName, setNewName] = useState<string>(props.deck.name)
    const formats = ["standard", "commander"]
    const [newFormat, setNewFormat] = useState<string>(props.deck.format)

    const [snackbarMessage, setSnackbarMessage] = useState<string>("")
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

    const submitUpdateDeck = () => {
        // make a clone, submit it without version data
        const deckClone = JSON.parse(JSON.stringify(props.deck));
        for (let i = 0; i < props.deck.cardEntries.length; i++) {
          deckClone.cardEntries[i].card.versions = []
        }
        deckClone.name = newName
        deckClone.format = newFormat
    
        axios.put(`http://localhost:8000/decks/`, deckClone).then(response => {
            props.onClose()
            props.fetchDecks()
        }).catch(req => {
            setSnackbarOpen(true)
            setSnackbarMessage(req.response.data)
        })
    }

    return (
        <Dialog
            open={props.opened}
            onClose={props.onClose}>
            <List>
                <ListItem
                    style={{ justifyContent: 'center' }}
                    sx={{ py: 1.5, fontSize: 20 }}>
                    Update deck {props.deck.name}
                </ListItem>

                <ListItem>
                    <TextField
                        defaultValue={props.deck.name}
                        variant="outlined"
                        required
                        label="Deck name"
                        onChange={event => setNewName(event.target.value)} />
                </ListItem>

                <ListItem>
                    <TextField
                        select
                        fullWidth
                        defaultValue={props.deck.format}
                        variant="outlined"
                        required
                        label="Format"

                        onChange={event => setNewFormat(event.target.value)}>
                        {formats.map((format) => (
                            <MenuItem key={format.toString()} value={format.toString()}>
                                <ListItemText
                                    primary={firstCharUpper(format)}
                                />
                            </MenuItem>
                        ))}
                    </TextField>
                </ListItem>

                <ListItem style={{ justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={submitUpdateDeck}
                        sx={{ margin: "10px" }}>
                        Update Deck
                    </Button>
                    <Button
                        variant="contained"
                        onClick={props.onClose}
                        sx={{ margin: "10px" }}>
                        Cancel
                    </Button>
                </ListItem>
            </List>
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={snackbarOpen}
                autoHideDuration={6000}>
                <Alert severity="error" sx={{ width: '100%' }}>{snackbarMessage}</Alert>
            </Snackbar>
        </Dialog>
    )
});