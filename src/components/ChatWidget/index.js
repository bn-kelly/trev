import 'react/jsx-runtime';

import ConnectedWidget from './src';
import {
  addUserMessage,
  addResponseMessage,
  addLinkSnippet,
  renderCustomComponent,
  toggleWidget,
  toggleInputDisabled,
  toggleMsgLoader,
  dropMessages,
  isWidgetOpened,
  setQuickButtons,
  deleteMessages,
  markAllAsRead,
  setBadgeCount
} from './src/store/dispatcher';

export {
  ConnectedWidget as ChatWidget,
  addUserMessage,
  addResponseMessage,
  addLinkSnippet,
  renderCustomComponent,
  toggleWidget,
  toggleInputDisabled,
  toggleMsgLoader,
  dropMessages,
  isWidgetOpened,
  setQuickButtons,
  deleteMessages,
  markAllAsRead,
  setBadgeCount
};
