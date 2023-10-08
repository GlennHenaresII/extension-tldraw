import { Tldraw } from '@tldraw/tldraw';
import React from 'react';
import { Component } from 'react';

class Draw extends Component {
    render() {
        return (
            <div style={{ position: 'fixed', inset: 0 }}>
                <Tldraw id="tl-draw" />
            </div>
        )
    }
}

const draw = document.getElementById('tl-draw')

//check for system dark mode or light mode
if (window.matchMedia('(prefers-color-scheme: dark)')) {
    draw?.setAttribute("darkMode", "true")
}

export default Draw;