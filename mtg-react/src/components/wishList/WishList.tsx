import { useState } from "react"
import { MTGCardDTO } from "../../../../mtg-common/src/DTO"

export interface WishlistProps {
    wishlistedCards: MTGCardDTO[]
  }
  
  export default function Wishlist(props: WishlistProps) {
    const [shoppingBasketContent, setShoppingBasketContent] = useState<MTGCardDTO[]>([])
    return (<></>)
  }