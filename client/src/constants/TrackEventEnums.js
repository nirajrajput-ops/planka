/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

// How something was done, as reported with Pendo Track Events. These travel
// along with the action from whatever dispatched it: by the time a saga learns
// the outcome, the gesture behind it is long gone.

export const BoardSearchSources = {
  TYPING: 'typing',
};

export const CardMoveMethods = {
  DRAG_AND_DROP: 'drag_and_drop',
  MOVE_CARD_STEP: 'move_card_step',
  LIST_SELECT: 'list_select',
  RESTORE: 'restore',
  ARCHIVE: 'archive',
  TRASH: 'trash',
  CUT_PASTE: 'cut_paste',
};

export const CardDuplicateMethods = {
  MENU: 'menu',
  COPY_PASTE: 'copy_paste',
};

export const AttachmentSources = {
  FILE_PICKER: 'file_picker',
  DROP: 'drop',
  PASTE_FILE: 'paste_file',
  PASTE_LINK: 'paste_link',
  PASTE_TEXT: 'paste_text',
};

export const CommentSubmitMethods = {
  BUTTON: 'button',
  KEYBOARD_SHORTCUT: 'keyboard_shortcut',
};
