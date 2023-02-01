import React, { useEffect, useState } from 'react';
import {
  ChatWidget,
  toggleMsgLoader,
  addUserMessage,
  addResponseMessage,
  renderCustomComponent,
} from '../../components/ChatWidget';
import GoogleAuth from '../../components/GoogleAuth';
import UrgentButtons from '../../components/UrgentButtons';
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
              `**${email.from}**\n${email.content.substring(0, 39)}...`
            );
          }
        }
      }
    );
  };

  const handleInvestorUpdates = () => {
    const message = 'find emails with investor updates';
    addUserMessage(message);
    handleNewUserMessage(message);
  }

  const handleFundraisingPitches = () => {
    const message = 'find emails with fundraise pitches';
    addUserMessage(message);
    handleNewUserMessage(message);
  }

  const handleWarmIntros = () => {
    const message = 'find emails with warm intros';
    addUserMessage(message);
    handleNewUserMessage(message);
  }

  useEffect(() => {
    const getStatus = async () => {
      const isAuthorizedGoogle = await getValueFromStorage(
        IS_AUTHORIZED_GOOGLE
      );
      setAuthorized(isAuthorizedGoogle);

      if (isAuthorizedGoogle) {
        const interval = setInterval(async () => {
          const isEmailsImported = await getValueFromStorage(IS_EMAILS_IMPORTED);
          setEmailsImported(isEmailsImported);
          if (isEmailsImported) {
            clearInterval(interval);
          }
        }, 1000);
      }
    };
    getStatus();

    addResponseMessage('gm! what emails would you like to find?');
    renderCustomComponent(UrgentButtons, {
      handleInvestorUpdates,
      handleFundraisingPitches,
      handleWarmIntros,
    }, false, 'urgent-buttons');
  }, []);

  return (
    <div>
      {authorized == 0 && (
        <GoogleAuth handleAuthorization={handleAuthorization} />
      )}
      {authorized == 1 && (
        <ChatWidget
          title="Trev"
          senderPlaceHolder="what would you like to find?"
          showSpinner={!emailsImported}
          showBadge={false}
          handleNewUserMessage={handleNewUserMessage}
        />
      )}
    </div>
  );
};

export default Content;
