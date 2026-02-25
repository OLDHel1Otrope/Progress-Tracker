import { PoolClient } from "pg"

interface fixPositionProps {
    client: PoolClient,
    date: string
}

export const fixPosition = ({ client, date }: fixPositionProps) => {
    //for a particular date we fix the orders after deleting

}