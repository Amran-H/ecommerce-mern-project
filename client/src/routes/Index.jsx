import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'
import Register from '../pages/Register'
import Login from '../pages/Login'
import Error from '../pages/Error'
import Cart from '../pages/Cart'
import Navbar from '../layouts/Navbar'

const Index = () => {
    return <BrowserRouter>
        <Navbar />
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/register' element={<Register />} />
            <Route path='/login' element={<Login />} />
            <Route path='/logout' element={<Login />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/*' element={<Error />} />
        </Routes>
    </BrowserRouter>
}

export default Index