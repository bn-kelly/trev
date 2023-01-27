import React from 'react';
import { createRoot } from 'react-dom/client';
import { printLine } from './modules/print';
import { ChatWidget, toggleMsgLoader, addResponseMessage } from '../../components/ChatWidget';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");
const container = document.createElement('div');
container.id = 'trev-chat-container';

document.body.appendChild(container);

const handleNewUserMessage = (message) => {
    toggleMsgLoader();
    setTimeout(() => {
        toggleMsgLoader();
        console.log('Me:', message);
        addResponseMessage('OK, I got it');
    }, 2000);
};
const root = createRoot(container);
root.render(<ChatWidget
    title='Trev'
    senderPlaceHolder='what would you like to find'
    handleNewUserMessage={handleNewUserMessage}
/>);

