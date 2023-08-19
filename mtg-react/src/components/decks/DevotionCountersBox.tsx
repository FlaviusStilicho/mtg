import { Component } from 'react';
import { DeckCardEntryDTO } from '../../../../mtg-common/src/DTO';
import { Box } from '@mui/material';

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

        // TODO finish me
        return (<Box>
            </Box>)
    }
}