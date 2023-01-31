import { getValueFromStorage, setValueToStorage } from '../../global';
import { OPENAI_API_KEY } from 'secrets';
import {
  AUTHORIZE_GOOGLE,
  NEW_USER_MESSAGE,
  IMPORT_EMAILS,
  IS_AUTHORIZED_GOOGLE,
  IS_EMAILS_IMPORTED,
  EMAILS,
  STORAGE_GLOBAL,
  STORAGE_LOCAL,
} from '../../constants';

async function init() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    onMessageReceived(request, sender, sendResponse);
    return true;
  });

  chrome.runtime.onInstalled.addListener(() => {
    chrome.identity.clearAllCachedAuthTokens(async () => {
      const token = await getAuthToken(false);
      if (!token) {
        await setValueToStorage({ [IS_AUTHORIZED_GOOGLE]: 0 });
        await setValueToStorage({ [IS_EMAILS_IMPORTED]: false });
      } else {
        await setValueToStorage({ [IS_EMAILS_IMPORTED]: false });
        importEmails();
      }
      chrome.tabs.create({ url: 'https://mail.google.com/' });
    });
  });
}

async function onMessageReceived(request, sender, sendResponse) {
  if (request.action === AUTHORIZE_GOOGLE) {
    const token = await getAuthToken(true);

    if (token) {
      await setValueToStorage({ [IS_AUTHORIZED_GOOGLE]: 1 });
      sendResponse(1);
    } else {
      await setValueToStorage({ [IS_AUTHORIZED_GOOGLE]: 0 });
      sendResponse(0);
    }
  } else if (request.action === IMPORT_EMAILS) {
    await importEmails();
    sendResponse(true);
  } else if (request.action === NEW_USER_MESSAGE) {
    const emails = await getValueFromStorage(EMAILS, STORAGE_LOCAL);
    if (emails.length === 0) {
      sendResponse([]);
    }

    const message = request.data.message;
    const answers = await runQuery(message, emails);

    if (answers.length > 0) {
      sendResponse(answers);
    } else {
      sendResponse([]);
    }
  }
}

async function getAuthToken(interactive) {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: interactive }, (token) => {
      resolve(token);
    });
  });
}

async function importEmails() {
  let emails = await getEmails();
  emails = await summarizeEmails(emails);

  await setValueToStorage({ [EMAILS]: emails }, STORAGE_LOCAL);
  await setValueToStorage({ [IS_EMAILS_IMPORTED]: true });
  console.log('emails', emails);
}

async function getEmails() {
  let response = await getEmailsWithPageToken(null);
  let nextPageToken = response.nextPageToken;
  let emailIdList = response.messages;
  let ret = [];

  while (nextPageToken) {
    response = await getEmailsWithPageToken(nextPageToken);
    nextPageToken = response.nextPageToken;
    emailIdList = [...emailIdList, ...response.messages];
  }

  for (const emailId of emailIdList) {
    const email = await getEmail(emailId.id);

    if (ret.length > 9) {
      break;
    }

    if (email) {
      let data = '';
      if (email.payload.parts && email.payload.parts.length > 0) {
        const part = email.payload.parts.find((part) => {
          return part.mimeType === 'text/plain';
        });
        if (part) {
          data = part.body.data;
        } else {
          continue;
        }
      } else {
        if (email.payload.mimeType === 'text/plain') {
          data = email.payload.body.data;
        } else {
          continue;
        }
      }

      const subject = email.payload.headers.find((h) => {
        return h.name === 'Subject';
      });

      const from = email.payload.headers.find((h) => {
        return h.name === 'From';
      });

      const to = email.payload.headers.find((h) => {
        return h.name === 'To';
      });
      console.log('original email', email);
      ret.push({
        id: email.id,
        threadId: email.threadId,
        date: email.internalDate,
        content: decodeBase64(data),
        subject: subject ? subject.value : '',
        from: from ? from.value : '',
        to: to ? to.value : '',
      });
    }
  }

  return ret;
}

async function getEmailsWithPageToken(pageToken) {
  const token = await getAuthToken(false);
  if (!token) {
    return { messages: [], nextPageToken: null };
  }

  // const today = new Date();
  // const qDate = new Date(new Date().setDate(today.getDate() - 30));
  // const query = `after:${qDate.getFullYear()}/${qDate.getMonth() + 1}/${qDate.getDate()}`;
  // let url =
  // `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500&q=${query}`;
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500`;
  if (pageToken) {
    url = `${url}&pageToken=${pageToken}`;
  }

  return new Promise((resolve) => {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log('error', error);
        resolve({ messages: [], nextPageToken: null });
      });
  });
}

async function getEmail(id) {
  const token = await getAuthToken(false);
  if (!token) {
    return null;
  }

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;

  return new Promise((resolve) => {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        console.log('error', error);
        resolve(null);
      });
  });
}

function decodeBase64(input) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');

  // Pad out with standard base64 required padding characters
  var pad = input.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error(
        'InvalidLengthError: Input base64url string is the wrong length to determine padding'
      );
    }
    input += new Array(5 - pad).join('=');
  }

  return atob(input);
}

async function summarizeEmails(emails) {
  for (const email of emails) {
    const prompt = `Summarize this for a business focus:
            ${email.content
        .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')
        .replace(/(\r\n|\n|\r)/gm, '')}`;
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      email.summary = data.choices[0].text;
    }
  }

  return emails;
}

async function runQuery(message, emails) {
  let prompt = '';
  for (const email of emails) {
    prompt = `${prompt}Q: question_id=${email.id}\nA: ${email.subject} ${email.summary}\n`;
  }
  prompt = `${prompt}Q: show me only question_id associated to ${message}`;

  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      temperature: 0,
      max_tokens: 60,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    }),
  });
  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    const regex = /[^a-f0-9]([a-f0-9]{16})/g;
    let m, ids = [];
    while (m = regex.exec(data.choices[0].text)) {
      ids.push(m[1]);
    }

    const answers = emails.filter((e) => {
      return ids.includes(e.id);
    });

    if (answers.length > 0) {
      return answers;
    }
  }

  return [];
}

init();
