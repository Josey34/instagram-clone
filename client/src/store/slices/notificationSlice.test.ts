import { describe, expect, it } from 'vitest';
import type { NotificationState } from '../../types';
import notificationReducer, { addNotification, clearNotifications, removeNotification } from './notificationSlice';

describe('notificationSlice', () => {
  const initialState = {
    notifications: [],
  };

  it('should add a notification', () => {
    // ARRANGE
    const state = initialState;
    const action = addNotification({ message: 'Test', type: 'info' });

    // ACT
    const newState = notificationReducer(state, action);

    // ASSERT
    expect(newState.notifications).toHaveLength(1);
    expect(newState.notifications[0].message).toBe('Test');
  });
  
  it('should remove notification by id', () => {
    // ARRANGE
    const stateWithNotifications: NotificationState = {
      notifications: [
        { id: '1', message: 'First', type: 'info' },
        { id: '2', message: 'Second', type: 'error'},
      ],
    };

    // ACT
    const newState = notificationReducer(stateWithNotifications, removeNotification('1'));

    // ASSERT
    expect(newState.notifications).toHaveLength(1);
    expect(newState.notifications[0].id).toBe('2');
  });
  
  it('should clear notification', () => {
    // ARRANGE
    const stateWithNotifications: NotificationState = {
      notifications: [
        { id: '1', message: 'First', type: 'info' },
        { id: '2', message: 'Second', type: 'error'},
      ],
    };

    // ACT
    const newState = notificationReducer(stateWithNotifications, clearNotifications());

    // ASSERT
    expect(newState.notifications).toHaveLength(0);
  })
});
