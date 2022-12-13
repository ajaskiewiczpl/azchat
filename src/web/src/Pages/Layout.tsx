import React from 'react'
import { Outlet } from 'react-router-dom'

type Props = {}

function Layout({ }: Props) {
    return (
        <main>
            <Outlet />
        </main>
    )
}

export default Layout