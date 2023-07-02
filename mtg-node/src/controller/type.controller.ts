import { Request, Response } from "express";

const types: string[] = [
    "Legendary",
    "Land", 
    "Creature", 
    "Artifact", 
    "Enchantment", 
    "Planeswalker", 
    "Instant", 
    "Sorcery"
]
export const GetTypes = async (req: Request, res: Response) => {
    res.send({
        data: types
    })
}