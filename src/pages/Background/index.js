import { setValueToStorage } from '../../global';
import { Authorize_Google } from '../../constants';

const emails = [];

async function init() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        onMessageReceived(request, sender, sendResponse);
        return true;
    });
    getEmails();
}

async function onMessageReceived(request, sender, sendResponse) {
    if (request.action === Authorize_Google) {
        const token = await getAuthToken();

        if (token) {
            setValueToStorage({ is_authorized_google: true });
        } else {
            setValueToStorage({ is_authorized_google: false });
        }

        sendResponse(!!token);
    }
}

async function getAuthToken() {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            resolve(token);
        });
    });
}

async function getEmails() {
    const token = await getAuthToken();
    if (!token) {
        return;
    }

    let response = await getEmailsWithPageToken(null, token);
    let nextPageToken = response.nextPageToken;
    let emailIdList = response.messages;

    while (nextPageToken) {
        response = await getEmailsWithPageToken(nextPageToken, token);
        nextPageToken = response.nextPageToken;
        emailIdList = [...emailIdList, ...response.messages];
    }
    console.log('emailIdList', emailIdList);

    for (const emailId of emailIdList) {
        const content = await getEmailContent(emailId.id);
        if (content) {
            emails.push(content);
        }
    }

    console.log('emails', emails);
}

async function getEmailsWithPageToken(pageToken) {
    const token = await getAuthToken();
    if (!token) {
        return { messages: [], nextPageToken: null };
    }

    let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=500';
    if (pageToken) {
        url = `${url}&pageToken=${pageToken}`;
    }

    return new Promise((resolve) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }).then((response) => {
            return response.json();
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            console.log("error", error);
            resolve({ messages: [], nextPageToken: null });
        })
    });
}

async function getEmailContent(id) {
    const token = await getAuthToken();
    if (!token) {
        return null;
    }

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=raw`;

    return new Promise((resolve) => {
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        }).then((response) => {
            return response.json();
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            console.log("error", error);
            resolve(null);
        })
    });
}

init();