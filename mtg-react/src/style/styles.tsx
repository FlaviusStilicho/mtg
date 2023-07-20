export const buttonSizeStyle = {
    height: 30,
    width: 30,
    minHeight: 0,
    minWidth: 0,
    padding: 0,
    margin: 5,
};

export const staticButtonStyle = {
    ...buttonSizeStyle,
    opacity: 1,
    backgroundColor: "3C00E0"
};

export const flipButtonStyle = {
    ...buttonSizeStyle,
    opacity: 1,
    backgroundColor: "#f1ee8e"
};

export const largebuttonSizeStyle = {
    height: 60,
    width: 60,
    padding: 0,
    margin: 10,
};

export const largeFlipButtonStyle = {
    ...largebuttonSizeStyle,
    opacity: 1,
    backgroundColor: "#f1ee8e",
};

export const cardTextFieldStyle = {
    ...buttonSizeStyle,
    opacity: 1,
    backgroundColor: "White",
    alignItems: "center",
    verticalAlign: "bottom"
};

export const searchLabelStyle = {
    height: 30,
    width: 200,
    opacity: 1,
    alignItems: "right",
};

export const searchTextFieldStyle = {
    height: 30,
    width: "100%",
    borderRadius: "10px",
    opacity: 1,
};

export const deckEntryStyle = {
    height: 10,
    opacity: 1,
};

export const deckEntryTextBoxStyle = {
        p: 0.5,
        py: 0.02,
        m: 0.2,
        fontSize: '0.7rem',
        fontWeight: '700',
}

export const selectListItemStyle = {
    color: 'black',

    fontSize: '8',
    selected: {
        color: 'green',
        background: 'red',
      },    
}

export const buttonBackgroundStyle = {
    bgcolor: "White"
  }

export const listItemStyle = {
  py: '1px',

//   borderRadius: '20%',
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
//   px: 3,
};

export const searchBarListItemStyle = {
    ...listItemStyle,
    color: 'rgba(255, 255, 255, 0.7)',
    '&:hover, &:focus': {
      bgcolor: 'rgba(255, 255, 255, 0.08)',
    },
}