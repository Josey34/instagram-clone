import type { NotificationState } from "@/types";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import notificationReducer from "../store/slices/notificationSlice";
import Alert from "./Alert";

describe("Alert Component", () => {
  it("should render nothing if no notifications", () => {
    // ARRANGE
    const store = configureStore({
      reducer: {
        notification: notificationReducer,
      },
    });

    // ACT
    const { container } = render(
      <Provider store={store}>
        <Alert />
      </Provider>,
    );

    // ASSERT
    expect(container.firstChild).toBeNull();
  });

  it("should renders first notification message", () => {
    // ARRANGE
    const notificationState: NotificationState = {
      notifications: [{ id: "1", message: "Test", type: "info" }],
    };

    const store = configureStore({
      reducer: {
        notification: notificationReducer,
      },
      preloadedState: {
        notification: notificationState,
      },
    });

    // ACT
    render(
      <Provider store={store}>
        <Alert />
      </Provider>,
    );

    // ASSERT
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("should remove notification after 2 seconds", () => {
    // ARRANGE
    vi.useFakeTimers();

    const notificationState: NotificationState = {
      notifications: [{ id: "1", message: "Test", type: "info" }],
    };

    const store = configureStore({
      reducer: {
        notification: notificationReducer,
      },
      preloadedState: {
        notification: notificationState,
      },
    });

    // ACT
    render(
      <Provider store={store}>
        <Alert />
      </Provider>,
    );

    // ASSERT
    expect(screen.getByText("Test")).toBeInTheDocument();

    vi.advanceTimersByTime(2000);

    waitFor(() => {
      expect(screen.queryByText("Test")).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
});
