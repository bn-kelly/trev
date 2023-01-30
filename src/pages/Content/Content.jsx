import React, { useEffect, useState } from 'react';
import { ChatWidget, toggleMsgLoader, addResponseMessage } from '../../components/ChatWidget';
import GoogleAuth from '../../components/GoogleAuth';
import { Authorize_Google } from '../../constants';
import { getValueFromStorage } from '../../global';
    
const Content = () => {
    const [authorized, setAuthorized] = useState();
    
    useEffect(() => {
        const getAuthStatus = async () => {
            const result = await getValueFromStorage('is_authorized_google');
            console.log('result', result);
            setAuthorized(result);
        }
        getAuthStatus();s
    }, [])
    
    const handleAuthorization = () => {
        chrome.runtime.sendMessage({
            action: Authorize_Google
        }, (response) => {
            setAuthorized(response);
        });
    };

    const handleNewUserMessage = (message) => {
        toggleMsgLoader();
        setTimeout(() => {
            toggleMsgLoader();
            console.log('Me:', message);
            addResponseMessage('OK, I got it');
        }, 2000);
    };

    return (
        <div>
            { authorized &&
            <ChatWidget
                title='Trev'
                senderPlaceHolder='what would you like to find?'
                handleNewUserMessage={handleNewUserMessage}
            />}
            { !authorized && <GoogleAuth handleAuthorization={handleAuthorization} />}
        </div>
    );
};

export default Content;
