import React, { useEffect, useState } from 'react';
import { ChatWidget, toggleMsgLoader, addResponseMessage } from '../../components/ChatWidget';
import GoogleAuth from '../../components/GoogleAuth';
import { AUTHORIZE_GOOGLE, NEW_USER_MESSAGE } from '../../constants';
import { getValueFromStorage } from '../../global';
    
const Content = () => {
    const [authorized, setAuthorized] = useState(-1);
    
    useEffect(() => {
        const getAuthStatus = async () => {
            const result = await getValueFromStorage('is_authorized_google');
            console.log('result', result);
            setAuthorized(result);
        }
        getAuthStatus();

        addResponseMessage('gm! what emails would you like to find?');
    }, [])
    
    const handleAuthorization = () => {
        chrome.runtime.sendMessage({
            action: AUTHORIZE_GOOGLE
        }, (response) => {
            setAuthorized(response);
        });
    };

    const handleNewUserMessage = (message) => {
        toggleMsgLoader();
        chrome.runtime.sendMessage({
            action: NEW_USER_MESSAGE,
            data: {
                message,
            },
        }, (response) => {
            toggleMsgLoader();
            addResponseMessage(response);
        });
    };

    return (
        <div>
            { authorized == 1 &&
                <ChatWidget
                    title='Trev'
                    senderPlaceHolder='what would you like to find?'
                    showBadge={false}
                    handleNewUserMessage={handleNewUserMessage}
                />
            }
            {authorized == 0 &&
                <GoogleAuth handleAuthorization={handleAuthorization}/>
            }
        </div>
    );
};

export default Content;
