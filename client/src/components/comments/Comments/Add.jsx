/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import keyBy from 'lodash/keyBy';
import React, { useCallback, useState, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Mention, MentionsInput } from 'react-mentions';
import { Button, Form } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, useToggle } from '../../../lib/hooks';

import selectors from '../../../selectors';
import entryActions from '../../../entry-actions';
import { useEscapeInterceptor, useForm, useNestedRef } from '../../../hooks';
import { isUsernameChar, mentionTextToMarkup } from '../../../utils/mentions';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { CommentSubmitMethods } from '../../../constants/TrackEventEnums';
import UserAvatar from '../../users/UserAvatar';

import styles from './Add.module.scss';

const DEFAULT_DATA = {
  text: '',
};

const Add = React.memo(({ initialText, onInitialTextConsumed }) => {
  const boardMemberships = useSelector(selectors.selectMembershipsForCurrentBoard);

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [data, , setData] = useForm(DEFAULT_DATA);
  const [isOpened, setIsOpened] = useState(false);
  const [selectTextFieldState, selectTextField] = useToggle();

  const textFieldRef = useRef(null);
  const textMentionsRef = useRef(null);
  const textInputRef = useRef(null);
  const [buttonRef, handleButtonRef] = useNestedRef();

  // Whether the draft started from a Reply prefill, reported with the comment
  const isReplyRef = useRef(false);

  const userByUsername = useMemo(
    () =>
      keyBy(
        boardMemberships.flatMap(({ user }) => (user.username ? user : [])),
        'username',
      ),
    [boardMemberships],
  );

  const submit = useCallback(
    (submitMethod) => {
      const cleanData = {
        ...data,
        text: mentionTextToMarkup(data.text.trim(), userByUsername),
      };

      if (!cleanData.text) {
        textInputRef.current.select();
        return;
      }

      dispatch(
        entryActions.createCommentInCurrentCard({
          ...cleanData,
          isReply: isReplyRef.current,
          submitMethod,
        }),
      );

      isReplyRef.current = false;
      setData(DEFAULT_DATA);
      selectTextField();
    },
    [dispatch, data, setData, selectTextField, userByUsername],
  );

  const handleEscape = useCallback(() => {
    if (textMentionsRef.current.isOpened()) {
      textMentionsRef.current.clearSuggestions();
      return;
    }

    setIsOpened(false);
    textInputRef.current.blur();
  }, []);

  const [activateEscapeInterceptor, deactivateEscapeInterceptor] =
    useEscapeInterceptor(handleEscape);

  const handleSubmit = useCallback(() => {
    submit(CommentSubmitMethods.BUTTON);
  }, [submit]);

  const handleFieldFocus = useCallback(() => {
    setIsOpened(true);
  }, []);

  const handleFieldChange = useCallback(
    (_, text) => {
      // Clearing the field out leaves nothing of a Reply prefill behind
      if (!text) {
        isReplyRef.current = false;
      }

      setData({
        text: !isUsernameChar(text.slice(-1)) ? mentionTextToMarkup(text, userByUsername) : text,
      });
    },
    [setData, userByUsername],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (isModifierKeyPressed(event) && event.key === 'Enter') {
        submit(CommentSubmitMethods.KEYBOARD_SHORTCUT);
      }
    },
    [submit],
  );

  const handleAwayClick = useCallback(() => {
    setIsOpened(false);
  }, []);

  const handleClickAwayCancel = useCallback(() => {
    textInputRef.current.focus();
  }, []);

  const clickAwayProps = useClickAwayListener(
    [textFieldRef, buttonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  const suggestionRenderer = useCallback(
    (entry, _, highlightedDisplay) => (
      <div className={styles.suggestion}>
        <UserAvatar id={entry.id} size="tiny" />
        {highlightedDisplay}
      </div>
    ),
    [],
  );

  useDidUpdate(() => {
    if (isOpened) {
      activateEscapeInterceptor();
    } else {
      deactivateEscapeInterceptor();
    }
  }, [isOpened]);

  useDidUpdate(() => {
    textInputRef.current.focus();
  }, [selectTextFieldState]);

  useDidUpdate(() => {
    if (!initialText) {
      return;
    }

    setData({
      text: initialText,
    });
    isReplyRef.current = true;
    setIsOpened(true);
    selectTextField();
    onInitialTextConsumed();
  }, [initialText, onInitialTextConsumed, selectTextField, setData]);

  return (
    <Form onSubmit={handleSubmit}>
      <div ref={textFieldRef} className={styles.field}>
        <MentionsInput
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          allowSpaceInQuery
          allowSuggestionsAboveCursor
          ref={textMentionsRef}
          inputRef={textInputRef}
          value={data.text}
          placeholder={t('common.writeComment')}
          maxLength={1048576}
          rows={isOpened ? 3 : 1}
          className="mentions-input"
          style={{
            control: {
              minHeight: isOpened ? '79px' : '37px',
            },
          }}
          onFocus={handleFieldFocus}
          onChange={handleFieldChange}
          onKeyDown={handleFieldKeyDown}
        >
          <Mention
            appendSpaceOnAdd
            data={boardMemberships.map(({ user }) => ({
              id: user.id,
              display: user.username || user.name,
            }))}
            displayTransform={(_, display) => `@${display}`}
            renderSuggestion={suggestionRenderer}
            className={styles.mention}
          />
        </MentionsInput>
      </div>
      {(isOpened || data.text.length > 0) && (
        <div className={styles.controls}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            positive
            ref={handleButtonRef}
            content={t('action.addComment')}
            className={styles.button}
          />
        </div>
      )}
    </Form>
  );
});

Add.propTypes = {
  initialText: PropTypes.string,
  onInitialTextConsumed: PropTypes.func,
};

Add.defaultProps = {
  initialText: undefined,
  onInitialTextConsumed: () => {},
};

export default Add;
