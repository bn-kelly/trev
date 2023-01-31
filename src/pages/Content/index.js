import React from 'react';
import { createRoot } from 'react-dom/client';
import "@fontsource/dm-sans";
import Content from './Content';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

const container = document.createElement('div');
container.id = 'trev-container';
document.body.appendChild(container);
const root = createRoot(container);
root.render(<Content />);

