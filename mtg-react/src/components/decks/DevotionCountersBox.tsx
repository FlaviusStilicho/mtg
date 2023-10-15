import { Component } from 'react';
import { DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { Box, List } from '@mui/material';
import ColorIcon from '../ColorIcon';
import { colorDevotionBoxStyle } from '../../style/styles';
import { areSetsEqual } from '../../functions/util';

interface ColorDevotion {
    red: number,
    blue: number,
    green: number,
    black: number,
    white: number,
    colorless: number,
    x: number
    total: number
    average: number
}

export interface DevotionCountersBoxProps {
    entries: DeckCardEntryDTO[]
  }
  
  export class DevotionCountersBox extends Component<DevotionCountersBoxProps> {
    shouldComponentUpdate(nextProps: DevotionCountersBoxProps) {
      const currentCards = new Set(this.props.entries.map(entry => entry.card.name))
      const nextCards = new Set(nextProps.entries.map(entry => entry.card.name))
      if (!areSetsEqual(currentCards, nextCards)){
        return true
      }
      const currentCardCount: number = this.props.entries.length > 0 ? this.props.entries.map(entry => entry.copies).reduce((a, b) => a + b) : 0
      const nextCardCount: number = nextProps.entries.length > 0 ? nextProps.entries.map(entry => entry.copies).reduce((a, b) => a + b) : 0
      return currentCardCount !== nextCardCount
    }
  
    splitBraces(input: string): string[] {
        const matches = input.match(/{(.*?)}/g);
        return matches ? matches.map(str => str.substring(1, str.length - 1)) : [];
    }
    
    render() {
        const colorDevotionMap: ColorDevotion = {
            red: 0,
            blue: 0,
            green: 0,
            black: 0,
            white: 0,
            colorless: 0,
            x: 0,
            total: 0,
            average: 0,
        }
      
        this.props.entries.forEach(entry => { 
            const manaCostArr = this.splitBraces(entry.card.manaCost)
            manaCostArr.forEach(cost => {
                if (cost === "R" || cost === "R/P"){
                    colorDevotionMap.red += 1
                    colorDevotionMap.total += 1
                } else if (cost === "U" || cost === "U/P"){
                    colorDevotionMap.blue += 1
                    colorDevotionMap.total += 1
                } else if (cost === "G" || cost === "G/P"){
                    colorDevotionMap.green += 1
                    colorDevotionMap.total += 1
                } else if (cost === "B" || cost === "B/P"){
                    colorDevotionMap.black += 1
                    colorDevotionMap.total += 1
                } else if (cost === "W" || cost === "W/P"){
                    colorDevotionMap.white += 1
                    colorDevotionMap.total += 1
                } else if (cost === "C"){
                    colorDevotionMap.colorless += 1
                    colorDevotionMap.total += 1
                } else if (cost === "X"){
                    colorDevotionMap.x += 1
                }
                else if (!isNaN(Number(cost))){
                    colorDevotionMap.total += Number(cost)
                } else {
                    console.log(cost)
                }
            })
        })

        const totalNumberOfCardsInDeck = this.props.entries.length > 0 ? this.props.entries.map(entry => entry.copies).reduce((a, b) => a + b) : 0
        colorDevotionMap.average = colorDevotionMap.total / totalNumberOfCardsInDeck

        return (this.props.entries.length > 0) ? (
            <List>
            <Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}>Color devotion:</Box>
            { colorDevotionMap.white > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}><ColorIcon color="W" key="wD"/> {colorDevotionMap.white}</Box>) : <></> }
            { colorDevotionMap.blue > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}><ColorIcon color="U" key="UD"/> {colorDevotionMap.blue}</Box>) : <></> }
            { colorDevotionMap.black > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}><ColorIcon color="B" key="BD"/> {colorDevotionMap.black}</Box>) : <></> }
            { colorDevotionMap.red > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}><ColorIcon color="R" key="RD"/> {colorDevotionMap.red}</Box>) : <></> }
            { colorDevotionMap.green > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}><ColorIcon color="G" key="GD"/> {colorDevotionMap.green}</Box>) : <></> }
            { colorDevotionMap.colorless > 0 ? (<Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}> <ColorIcon color="C" key="CD"/> {colorDevotionMap.colorless}</Box>) : <></> }
            <Box style={{ textAlign: "left", marginLeft: 25 }} sx={colorDevotionBoxStyle}>Average mana cost: {colorDevotionMap.average.toFixed(1)}</Box>
            </List>
        ) : (<></>)
    }
}