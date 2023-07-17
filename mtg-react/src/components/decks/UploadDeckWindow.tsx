import { Alert, Button, Dialog, List, ListItem, MenuItem, Snackbar, TextField } from "@mui/material";
import { useState } from "react";
import axios from "axios";

export interface UploadDeckWindowProps {
    opened: boolean;
    onClose: () => void;
    fetchDecks: any;
}

export const UploadDeckWindow: React.FC<UploadDeckWindowProps> = (props) => {
    const [name, setName] = useState<string>("")
    const formats = ["Standard", "Commander"]
    const [selectedFormat, setSelectedFormat] = useState<string>("")

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
            onClose={props.onClose}
            PaperProps={{
                style: {

                },
            }}
        >
            <List>
                <ListItem sx={{ py: 1.5, fontSize: 20 }}>
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

                <ListItem>
                    <Button
                        variant="contained"
                        onClick={submitNewDeck}>
                        Create Deck
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