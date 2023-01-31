import React, { useEffect, useState } from 'react';
import {
  ChatWidget,
  toggleMsgLoader,
  addResponseMessage,
} from '../../components/ChatWidget';
import GoogleAuth from '../../components/GoogleAuth';
import Spinner from '../../components/Spinner';
import { getValueFromStorage } from '../../global';
import {
  AUTHORIZE_GOOGLE,
  NEW_USER_MESSAGE,
  IMPORT_EMAILS,
  IS_AUTHORIZED_GOOGLE,
  IS_EMAILS_IMPORTED,
} from '../../constants';

const Content = () => {
  const [authorized, setAuthorized] = useState(-1);
  const [emailsImported, setEmailsImported] = useState(false);

  useEffect(() => {
    const getStatus = async () => {
      const isAuthorizedGoogle = await getValueFromStorage(
        IS_AUTHORIZED_GOOGLE
      );
      const isEmailsImported = await getValueFromStorage(IS_EMAILS_IMPORTED);
      setAuthorized(isAuthorizedGoogle);
      setEmailsImported(isEmailsImported);
    };
    getStatus();

    addResponseMessage('gm! what emails would you like to find?');
  }, []);

  const handleAuthorization = () => {
    chrome.runtime.sendMessage(
      {
        action: AUTHORIZE_GOOGLE,
      },
      (response) => {
        setAuthorized(response);
        chrome.runtime.sendMessage(
          {
            action: IMPORT_EMAILS,
          },
          (response) => {
            setEmailsImported(response);
          }
        );
      }
    );
  };

  const handleNewUserMessage = (message) => {
    toggleMsgLoader();
    chrome.runtime.sendMessage(
      {
        action: NEW_USER_MESSAGE,
        data: {
          message,
        },
      },
      (emails) => {
        toggleMsgLoader();

        if (emails.length === 0) {
          addResponseMessage('I cannot find any email.');
        } else {
          emails = emails.slice(0, 10);
          addResponseMessage(`here's the last ${emails.length}:`);
          for (const email of emails) {
            addResponseMessage(
              `${email.from}\n${email.content.substring(0, 39)}...`
            );
          }
        }
      }
    );
  };

  return (
    <div>
      {authorized == 0 && (
        <GoogleAuth handleAuthorization={handleAuthorization} />
      )}
      {authorized == 1 && !emailsImported && <Spinner />}
      {authorized == 1 && emailsImported && (
        <ChatWidget
          title="Trev"
          senderPlaceHolder="what would you like to find?"
          showBadge={false}
          handleNewUserMessage={handleNewUserMessage}
        />
      )}
    </div>
  );
};

export default Content;
