import type { SearchState } from "@/types";
import { describe, expect, it } from "vitest";
import searchReducer, { clearSearch, searchUsers } from "./searchSlice";

describe("searchSlice", () => {
  it("should handle clearSearch", () => {
    const state: SearchState = {
      query: "item 1",
      results: [],
      loading: false,
      error: null,
    };

    const newState = searchReducer(state, clearSearch());

    expect(newState.results).toHaveLength(0);
    expect(newState.loading).toBeFalsy();
    expect(newState.error).toBe(null);
  });
});

describe("searchUsers async thunk", () => {
  const initialState: SearchState = {
    query: "",
    results: [],
    loading: false,
    error: null,
  };
  it("should handle searchUsers.pending", () => {
    const state = initialState
    
    const newState = searchReducer(state, searchUsers.pending("item 1", 'search-id-1'));
    
    expect(newState.loading).toBe(true);
    expect(newState.error).toBeNull();
  });
  
  it("should handle searchUsers.fulfilled", () => {
    const state = initialState;
    
    const newState = searchReducer(state, searchUsers.fulfilled('item 1', 'search-id-1', 'item 1'));
    
    console.log(newState)
    expect(newState.loading).toBe(false);
    expect(newState.results).toBe("item 1");
  });
  
  it("should handle searchUsers.reject", () => {
    const state = initialState
    
    const newState = searchReducer(state, searchUsers.rejected(null, 'search-id-1', "item 1", "User not found"))
    
    expect(newState.loading).toBe(false);
    expect(newState.error).toBe("User not found");
  })
});
