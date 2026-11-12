/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Input, Message, Tab } from 'semantic-ui-react';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';

import styles from './ApiKeyPane.module.scss';

const ConfirmStates = {
  REGENERATE: 'REGENERATE',
  DELETE: 'DELETE',
};

const ApiKeyPane = React.memo(({ userId, onClose }) => {
  const selectUserById = useMemo(() => selectors.makeSelectUserById(), []);

  const user = useSelector((state) => selectUserById(state, userId));

  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [confirmState, setConfirmState] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateClick = useCallback(() => {
    if (user.apiKeyPrefix) {
      setConfirmState(ConfirmStates.REGENERATE);
    } else {
      dispatch(entryActions.createUserApiKey(userId));
    }
  }, [userId, user.apiKeyPrefix, dispatch]);

  const handleRegenerateConfirm = useCallback(() => {
    dispatch(entryActions.createUserApiKey(userId));
    setConfirmState(null);
  }, [userId, dispatch]);

  const handleDeleteConfirm = useCallback(() => {
    dispatch(entryActions.deleteUserApiKey(userId));
    onClose();
  }, [userId, onClose, dispatch]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    setConfirmState(ConfirmStates.DELETE);
  }, []);

  const handleCopyClick = useCallback(() => {
    if (isCopied) return;
    navigator.clipboard.writeText(user.apiKeyState.value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  }, [user.apiKeyState.value, isCopied]);

  if (confirmState === ConfirmStates.REGENERATE) {
    return (
      <Tab.Pane attached={false} className={styles.pane}>
        <p>{t('common.areYouSureYouWantToRegenerateThisApiKey')}</p>
        <Button
          content={t('action.regenerateApiKey')}
          data-testid="api-key-regenerate-confirm"
          onClick={handleRegenerateConfirm}
        />
        <Button content={t('action.cancel')} onClick={handleCancelConfirm} />
      </Tab.Pane>
    );
  }

  if (confirmState === ConfirmStates.DELETE) {
    return (
      <Tab.Pane attached={false} className={styles.pane}>
        <p>{t('common.areYouSureYouWantToDeleteThisApiKey')}</p>
        <Button
          negative
          content={t('action.deleteApiKey')}
          data-testid="api-key-delete-confirm"
          onClick={handleDeleteConfirm}
        />
        <Button content={t('action.cancel')} onClick={handleCancelConfirm} />
      </Tab.Pane>
    );
  }

  return (
    <Tab.Pane attached={false} className={styles.pane}>
      {user.apiKeyPrefix ? (
        <>
          {!user.apiKeyState.isCreating &&
            (user.apiKeyState.value ? (
              <>
                <Message
                  positive
                  header={t('common.apiKeyCreated', { context: 'title' })}
                  content={t('common.saveThisKeyItWillNotBeShownAgain')}
                />
                <div className={styles.valueWrapper}>
                  <Input fluid readOnly value={user.apiKeyState.value} className={styles.value} />
                  <Button
                    className={styles.copyButton}
                    data-testid="api-key-copy"
                    onClick={handleCopyClick}
                  >
                    <Icon fitted name={isCopied ? 'check' : 'copy'} />
                  </Button>
                </div>
              </>
            ) : (
              <Message
                warning
                header={`${user.apiKeyPrefix}_...`}
                content={t('common.fullKeyIsHiddenForSecurityReasons')}
              />
            ))}
          <Button
            fluid
            content={t('action.regenerateApiKey')}
            loading={user.apiKeyState.isCreating}
            disabled={user.apiKeyState.isCreating}
            data-testid="api-key-regenerate-open"
            className={styles.actionButton}
            onClick={handleGenerateClick}
          />
          <Button
            fluid
            content={t('action.deleteApiKey')}
            data-testid="api-key-delete-open"
            className={styles.actionButton}
            onClick={handleDeleteClick}
          />
        </>
      ) : (
        <>
          <div className={styles.content}>{t('common.noApiKeyCreated')}</div>
          <Button
            fluid
            positive
            content={t('action.createApiKey')}
            loading={user.apiKeyState.isCreating}
            disabled={user.apiKeyState.isCreating}
            data-testid="api-key-create"
            onClick={handleGenerateClick}
          />
        </>
      )}
    </Tab.Pane>
  );
});

ApiKeyPane.propTypes = {
  userId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ApiKeyPane;
