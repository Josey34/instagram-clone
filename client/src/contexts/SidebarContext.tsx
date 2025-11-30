import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarContextType {
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within SidebarProvider");
    }
    return context;
};
