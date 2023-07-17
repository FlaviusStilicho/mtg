import { Alert, Button, Dialog, List, ListItem, MenuItem, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export interface CreateDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    fetchDecks: any;
}

export const CreateDeckWindow: React.FC<CreateDeckWindowProps> = (props) => {
    const [name, setName] = useState<string>("")
    const formats = ["Standard", "Commander"]
    const [selectedFormat, setSelectedFormat] = useState<string>("Commander")

    const [snackbarMessage, setSnackbarMessage] = useState<string>("")
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false)

    const submitNewDeck = () => {
        axios.post(`http://localhost:8000/decks`, {
            name,
            format: selectedFormat
        }).then(response => {
            setName("")
            setSelectedFormat("")
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
                style={{justifyContent:'center'}}
                sx={{ py: 1.5, fontSize: 20 }}>
                    Create new deck
                </ListItem>

                <ListItem>
                    <TextField
                        defaultValue=""
                        variant="outlined"
                        required
                        label="Deck name"
                        onChange={event => setName(event.target.value)}/>
                </ListItem>

                <ListItem>
                    <TextField
                        select
                        fullWidth
                        defaultValue=""
                        variant="outlined"
                        required
                        label="Format"
                        onChange={event => setSelectedFormat(event.target.value)}>
                        {formats.map(format => (
                            <MenuItem key={format}
                                value={format}>
                                {format}
                            </MenuItem>
                        ))}
                    </TextField>
                </ListItem>

                <ListItem style={{justifyContent:'center'}}>
                    <Button
                        variant="contained"
                        onClick={submitNewDeck}
                        sx={{ margin: "10px"}}>
                        Create Deck
                    </Button>
                    <Button
                        variant="contained"
                        onClick={props.onClose}
                        sx={{ margin: "10px"}}>
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
}