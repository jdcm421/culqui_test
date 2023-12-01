export interface Card {
    email:string
    card_number:string
    cvv:string
    expiration_year:string
    expiration_mount:string,
    token_expiration?:Date
}
export interface CardRes {
    email: string
    card_number: string
    expiration_year: string
    expiration_mount: string
}

export interface UnitCard extends Card {
    token:string
}

export interface Cards {
    [key : string] : UnitCard
}