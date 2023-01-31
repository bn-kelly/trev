import React from 'react';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import cn from 'classnames';

import { GlobalState } from '../../store/types';
import { AnyFunction } from '../../utils/types';
import { openFullscreenPreview } from '../../store/actions';

import Header from './components/Header';
import Conversation from './components/Conversation';
import FullScreenPreview from './components/FullScreenPreview';

import './style.scss';

type Props = {
  title: string;
  titleAvatar?: string;
  subtitle: string;
  onSendMessage: AnyFunction;
  onToggleConversation: AnyFunction;
  senderPlaceHolder: string;
  onQuickButtonClicked: AnyFunction;
  profileAvatar?: string;
  profileClientAvatar?: string;
  showCloseButton: boolean;
  fullScreenMode: boolean;
  autofocus: boolean;
  customLauncher?: AnyFunction;
  onTextInputChange?: (event: any) => void;
  chatId: string;
  launcherOpenLabel: string;
  launcherCloseLabel: string;
  launcherCloseImg: string;
  launcherOpenImg: string;
  sendButtonAlt: string;
  showTimeStamp: boolean;
  imagePreview?: boolean;
  zoomStep?: number;
  showBadge?: boolean;
  resizable?: boolean;
  emojis?: boolean;
};

function WidgetLayout({
  title,
  titleAvatar,
  subtitle,
  onSendMessage,
  onToggleConversation,
  senderPlaceHolder,
  onQuickButtonClicked,
  profileAvatar,
  profileClientAvatar,
  showCloseButton,
  fullScreenMode,
  autofocus,
  customLauncher,
  onTextInputChange,
  chatId,
  launcherOpenLabel,
  launcherCloseLabel,
  launcherCloseImg,
  launcherOpenImg,
  sendButtonAlt,
  showTimeStamp,
  imagePreview,
  zoomStep,
  showBadge,
  resizable,
  emojis,
}: Props) {
  const dispatch = useDispatch();
  const { dissableInput, showChat, visible } = useSelector(
    (state: GlobalState) => ({
      showChat: state.behavior.showChat,
      dissableInput: state.behavior.disabledInput,
      visible: state.preview.visible,
    })
  );

  const messageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showChat) {
      messageRef.current = document.getElementById(
        'messages'
      ) as HTMLDivElement;
    }
    return () => {
      messageRef.current = null;
    };
  }, [showChat]);

  const eventHandle = (evt: any) => {
    if (evt.target && evt.target.className === 'rcw-message-img') {
      const { src, alt, naturalWidth, naturalHeight } =
        evt.target as HTMLImageElement;
      const obj = {
        src: src,
        alt: alt,
        width: naturalWidth,
        height: naturalHeight,
      };
      dispatch(openFullscreenPreview(obj));
    }
  };

  /**
   * Previewer needs to prevent body scroll behavior when fullScreenMode is true
   */
  useEffect(() => {
    const target = messageRef?.current;
    if (imagePreview && showChat) {
      target?.addEventListener('click', eventHandle, false);
    }

    return () => {
      target?.removeEventListener('click', eventHandle);
    };
  }, [imagePreview, showChat]);

  useEffect(() => {
    document.body.setAttribute(
      'style',
      `overflow: ${visible || fullScreenMode ? 'hidden' : 'auto'}`
    );
  }, [fullScreenMode, visible]);

  return (
    <div
      className={cn('rcw-widget-container', {
        'rcw-full-screen': fullScreenMode,
        'rcw-previewer': imagePreview,
        'rcw-close-widget-container ': !showChat,
      })}
    >
      <Header
        title={title}
        subtitle={subtitle}
        toggleChat={onToggleConversation}
        showCloseButton={showCloseButton}
        showLogo={!showChat}
        titleAvatar={titleAvatar}
        chatId={chatId}
        openLabel={launcherOpenLabel}
        closeLabel={launcherCloseLabel}
        closeImg={launcherCloseImg}
        openImg={launcherOpenImg}
        showBadge={showBadge}
      />
      {showChat && (
        <Conversation
          title={title}
          subtitle={subtitle}
          sendMessage={onSendMessage}
          senderPlaceHolder={senderPlaceHolder}
          profileAvatar={profileAvatar}
          profileClientAvatar={profileClientAvatar}
          toggleChat={onToggleConversation}
          showCloseButton={showCloseButton}
          disabledInput={dissableInput}
          autofocus={autofocus}
          titleAvatar={titleAvatar}
          className={showChat ? 'active' : 'hidden'}
          onQuickButtonClicked={onQuickButtonClicked}
          onTextInputChange={onTextInputChange}
          sendButtonAlt={sendButtonAlt}
          showTimeStamp={showTimeStamp}
          resizable={resizable}
          emojis={emojis}
        />
      )}
      {imagePreview && (
        <FullScreenPreview
          fullScreenMode={fullScreenMode}
          zoomStep={zoomStep}
        />
      )}
    </div>
  );
}

export default WidgetLayout;
