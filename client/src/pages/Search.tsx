import Layout from "@/components/Layout";
import UserSearchResult from "@/components/UserSearchResult";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { clearSearch, searchUsers } from "@/store/slices/searchSlice";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Search = () => {
    const dispatch = useAppDispatch();
    const [query, setQuery] = useState("");
    const searchState = useAppSelector((state) => state.search);
    const results = searchState?.results || [];
    const loading = searchState?.loading || false;

    // Debounced search effect
    useEffect(() => {
        // If query is empty, clear results
        if (!query.trim()) {
            dispatch(clearSearch());
            return;
        }

        // Set up debounce timer (300ms delay)
        const timeoutId = setTimeout(() => {
            dispatch(searchUsers(query.trim()));
        }, 300);

        // Cleanup function: clear timeout on unmount or when query changes
        return () => clearTimeout(timeoutId);
    }, [query, dispatch]);

    // Clear search when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearSearch());
        };
    }, [dispatch]);

    return (
        <Layout>
            <div className="max-w-2xl mx-auto p-4">
                {/* Search Input */}
                <div className="mb-6">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Card
                                key={i}
                                className="flex items-center gap-3 p-4"
                            >
                                <Skeleton className="w-12 h-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-3">
                        {results.map((user) => (
                            <UserSearchResult key={user._id} user={user} />
                        ))}
                    </div>
                )}

                {/* Empty State - No Query */}
                {!loading && !query.trim() && (
                    <Card className="p-12 text-center">
                        <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            Search for users
                        </h3>
                        <p className="text-muted-foreground">
                            Enter a username or name to find people
                        </p>
                    </Card>
                )}

                {/* Empty State - No Results */}
                {!loading && query.trim() && results.length === 0 && (
                    <Card className="p-12 text-center">
                        <SearchIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                            No users found
                        </h3>
                        <p className="text-muted-foreground">
                            Try searching for a different username
                        </p>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default Search;
