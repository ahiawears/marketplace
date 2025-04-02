import { ReactNode } from "react"

const EditLookbook = ({ children }: {children: ReactNode }) => {
    return (
        <>
            <div className="flex flex-col">
                <main>{ children }</main>
            </div> 
        </>
    )
}

export default EditLookbook;