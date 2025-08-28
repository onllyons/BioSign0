import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {getStoredValue, initStore, setStoredValueAsync} from "@/utils/Store";
import {isAuthenticated, login, logout, User, UserTokens} from "@/utils/Auth";
import Toast from "react-native-toast-message";
import {Dimensions, Text, View} from "react-native";
import {SERVER_AJAX_URL, SuccessResponse, useRequests} from "@/hooks/useRequests";

export interface DocumentVersion {
    id: string;
    version: number;
    createdAt: string;
    changes: string;
    size: number;
    sizeBytes: number;
}

export interface ActivityEvent {
    id: string;
    type: 'upload' | 'view' | 'sign' | 'share' | 'delete' | 'edit' | 'download';
    timestamp: string;
    user: string;
    device: string;
    description: string;
    metadata?: Record<string, any>;
}

export interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    sizeBytes: number;
    createdAt: string;
    signed: boolean;
    signedAt?: string;
    signedBy?: string;
    status: 'draft' | 'pending' | 'signed';
    description: string;
    content: string;
    versions: DocumentVersion[];
    activity: ActivityEvent[];
}

export interface UIPreferences {
    useSystemTheme: boolean;
    confirmBeforeDelete: boolean;
    showFileSize: boolean;
    enableHaptics: boolean;
    simulateErrors: boolean;
}

interface DataContextType {
    documents: Document[];
    uiPreferences: UIPreferences;
    addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'activity' | 'versions'>) => string;
    deleteDocument: (id: string) => boolean;
    signDocument: (id: string, signedBy: string) => boolean;
    shareDocument: (id: string, recipient: string, message?: string) => boolean;
    logEvent: (documentId: string, event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
    updateDocument: (id: string, updates: Partial<Document>) => boolean;
    updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
    getDocumentById: (id: string) => Document | undefined;
    getRecentActivity: (limit?: number) => ActivityEvent[];

    isDataLoaded: () => boolean;
    restartApp: () => void;
    updateAppState: () => void;
}

const initialDocuments: Document[] = [
    {
        id: '1',
        name: 'Employment Contract',
        type: 'Contract',
        size: '2.1 MB',
        sizeBytes: 2100000,
        createdAt: '2024-01-15T09:30:00Z',
        signed: true,
        signedAt: '2024-01-16T14:20:00Z',
        signedBy: 'John Doe',
        status: 'signed',
        description: 'Standard employment agreement with terms and conditions.',
        content: 'This employment contract outlines the terms of employment including salary, benefits, responsibilities, and other important details.',
        versions: [
            {
                id: 'v1-1',
                version: 1,
                createdAt: '2024-01-15T09:30:00Z',
                changes: 'Initial version',
                size: '2.1 MB',
                sizeBytes: 2100000,
            }
        ],
        activity: [
            {
                id: 'a1-1',
                type: 'upload',
                timestamp: '2024-01-15T09:30:00Z',
                user: 'John Doe',
                device: 'iPhone 15 Pro',
                description: 'Document uploaded successfully',
            },
            {
                id: 'a1-2',
                type: 'view',
                timestamp: '2024-01-15T09:32:00Z',
                user: 'John Doe',
                device: 'iPhone 15 Pro',
                description: 'Document opened for viewing',
            },
            {
                id: 'a1-3',
                type: 'sign',
                timestamp: '2024-01-16T14:20:00Z',
                user: 'John Doe',
                device: 'iPhone 15 Pro',
                description: 'Document signed digitally',
            }
        ]
    },
    {
        id: '2',
        name: 'NDA Agreement',
        type: 'Legal',
        size: '1.5 MB',
        sizeBytes: 1500000,
        createdAt: '2024-01-14T16:45:00Z',
        signed: false,
        status: 'pending',
        description: 'Non-disclosure agreement for confidential information.',
        content: 'This non-disclosure agreement ensures that confidential information shared between parties remains protected.',
        versions: [
            {
                id: 'v2-1',
                version: 1,
                createdAt: '2024-01-14T16:45:00Z',
                changes: 'Initial version',
                size: '1.5 MB',
                sizeBytes: 1500000,
            }
        ],
        activity: [
            {
                id: 'a2-1',
                type: 'upload',
                timestamp: '2024-01-14T16:45:00Z',
                user: 'John Doe',
                device: 'MacBook Pro',
                description: 'Document uploaded successfully',
            },
            {
                id: 'a2-2',
                type: 'view',
                timestamp: '2024-01-14T16:47:00Z',
                user: 'John Doe',
                device: 'MacBook Pro',
                description: 'Document opened for viewing',
            }
        ]
    },
    {
        id: '3',
        name: 'Project Proposal',
        type: 'Business',
        size: '3.8 MB',
        sizeBytes: 3800000,
        createdAt: '2024-01-13T10:15:00Z',
        signed: false,
        status: 'draft',
        description: 'Proposal for upcoming project development.',
        content: 'This project proposal outlines the scope, timeline, and deliverables for the upcoming development project.',
        versions: [
            {
                id: 'v3-1',
                version: 1,
                createdAt: '2024-01-13T10:15:00Z',
                changes: 'Initial draft',
                size: '3.8 MB',
                sizeBytes: 3800000,
            }
        ],
        activity: [
            {
                id: 'a3-1',
                type: 'upload',
                timestamp: '2024-01-13T10:15:00Z',
                user: 'John Doe',
                device: 'iPad Air',
                description: 'Document uploaded successfully',
            },
            {
                id: 'a3-2',
                type: 'share',
                timestamp: '2024-01-13T10:20:00Z',
                user: 'John Doe',
                device: 'iPad Air',
                description: 'Document shared via email',
                metadata: {recipient: 'team@company.com'}
            }
        ]
    },
    {
        id: '4',
        name: 'Service Agreement',
        type: 'Contract',
        size: '2.7 MB',
        sizeBytes: 2700000,
        createdAt: '2024-01-12T14:30:00Z',
        signed: true,
        signedAt: '2024-01-12T15:45:00Z',
        signedBy: 'John Doe',
        status: 'signed',
        description: 'Service agreement for consulting work.',
        content: 'This service agreement defines the scope of consulting services, payment terms, and deliverables.',
        versions: [
            {
                id: 'v4-1',
                version: 1,
                createdAt: '2024-01-12T14:30:00Z',
                changes: 'Initial version',
                size: '2.7 MB',
                sizeBytes: 2700000,
            }
        ],
        activity: [
            {
                id: 'a4-1',
                type: 'upload',
                timestamp: '2024-01-12T14:30:00Z',
                user: 'John Doe',
                device: 'MacBook Pro',
                description: 'Document uploaded successfully',
            },
            {
                id: 'a4-2',
                type: 'sign',
                timestamp: '2024-01-12T15:45:00Z',
                user: 'John Doe',
                device: 'MacBook Pro',
                description: 'Document signed digitally',
            }
        ]
    },
    {
        id: '5',
        name: 'Privacy Policy Update',
        type: 'Legal',
        size: '1.2 MB',
        sizeBytes: 1200000,
        createdAt: '2024-01-11T11:20:00Z',
        signed: false,
        status: 'draft',
        description: 'Updated privacy policy for review.',
        content: 'This document contains updates to our privacy policy reflecting new data protection requirements.',
        versions: [
            {
                id: 'v5-1',
                version: 1,
                createdAt: '2024-01-11T11:20:00Z',
                changes: 'Initial draft',
                size: '1.2 MB',
                sizeBytes: 1200000,
            },
            {
                id: 'v5-2',
                version: 2,
                createdAt: '2024-01-11T15:30:00Z',
                changes: 'Added GDPR compliance section',
                size: '1.3 MB',
                sizeBytes: 1300000,
            }
        ],
        activity: [
            {
                id: 'a5-1',
                type: 'upload',
                timestamp: '2024-01-11T11:20:00Z',
                user: 'John Doe',
                device: 'iPhone 15 Pro',
                description: 'Document uploaded successfully',
            },
            {
                id: 'a5-2',
                type: 'edit',
                timestamp: '2024-01-11T15:30:00Z',
                user: 'John Doe',
                device: 'iPhone 15 Pro',
                description: 'Document updated with new version',
            }
        ]
    }
];

const initialUIPreferences: UIPreferences = {
    useSystemTheme: false,
    confirmBeforeDelete: true,
    showFileSize: true,
    enableHaptics: false,
    simulateErrors: false,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

type InitResponse = SuccessResponse & {
    tokens: Pick<UserTokens, "accessToken">; // тут сервер возвращает только accessToken
    user: User;
    userAvailable: boolean;
};

export function DataProvider({children}: DataProviderProps) {
    const {sendDefaultRequest} = useRequests()
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [uiPreferences, setUIPreferences] = useState<UIPreferences>(initialUIPreferences);
    const [updateState, setUpdateState] = useState<boolean>(false)
    const [restartTick, setRestartTick] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true)

    const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addDocument = (documentData: Omit<Document, 'id' | 'createdAt' | 'activity' | 'versions'>): string => {
        const id = generateId();
        const now = new Date().toISOString();

        const newDocument: Document = {
            ...documentData,
            id,
            createdAt: now,
            versions: [
                {
                    id: `v${id}-1`,
                    version: 1,
                    createdAt: now,
                    changes: 'Initial version',
                    size: documentData.size,
                    sizeBytes: documentData.sizeBytes,
                }
            ],
            activity: [
                {
                    id: `a${id}-1`,
                    type: 'upload',
                    timestamp: now,
                    user: 'John Doe',
                    device: 'Current Device',
                    description: 'Document uploaded successfully',
                }
            ]
        };

        setDocuments(prev => [newDocument, ...prev]);
        return id;
    };

    const deleteDocument = (id: string): boolean => {
        const document = documents.find(doc => doc.id === id);
        if (!document) return false;

        // Log delete event before removing
        logEvent(id, {
            type: 'delete',
            user: 'John Doe',
            device: 'Current Device',
            description: 'Document deleted permanently',
        });

        setDocuments(prev => prev.filter(doc => doc.id !== id));
        return true;
    };

    const signDocument = (id: string, signedBy: string): boolean => {
        const now = new Date().toISOString();

        setDocuments(prev => prev.map(doc => {
            if (doc.id === id && !doc.signed) {
                const updatedDoc = {
                    ...doc,
                    signed: true,
                    signedAt: now,
                    signedBy,
                    status: 'signed' as const,
                };

                // Add sign activity
                updatedDoc.activity = [
                    ...doc.activity,
                    {
                        id: generateId(),
                        type: 'sign',
                        timestamp: now,
                        user: signedBy,
                        device: 'Current Device',
                        description: 'Document signed digitally',
                    }
                ];

                return updatedDoc;
            }
            return doc;
        }));

        return true;
    };

    const shareDocument = (id: string, recipient: string, message?: string): boolean => {
        const document = documents.find(doc => doc.id === id);
        if (!document) return false;

        logEvent(id, {
            type: 'share',
            user: 'John Doe',
            device: 'Current Device',
            description: 'Document shared via email',
            metadata: {recipient, message},
        });

        return true;
    };

    const logEvent = (documentId: string, event: Omit<ActivityEvent, 'id' | 'timestamp'>): void => {
        const eventId = generateId();
        const timestamp = new Date().toISOString();

        const newEvent: ActivityEvent = {
            ...event,
            id: eventId,
            timestamp,
        };

        setDocuments(prev => prev.map(doc => {
            if (doc.id === documentId) {
                return {
                    ...doc,
                    activity: [...doc.activity, newEvent],
                };
            }
            return doc;
        }));
    };

    const updateDocument = (id: string, updates: Partial<Document>): boolean => {
        const document = documents.find(doc => doc.id === id);
        if (!document) return false;

        setDocuments(prev => prev.map(doc => {
            if (doc.id === id) {
                return {...doc, ...updates};
            }
            return doc;
        }));

        return true;
    };

    const updateUIPreferences = (preferences: Partial<UIPreferences>): void => {
        setUIPreferences(prev => ({...prev, ...preferences}));
    };

    const getDocumentById = (id: string): Document | undefined => {
        return documents.find(doc => doc.id === id);
    };

    const getRecentActivity = (limit: number = 10): ActivityEvent[] => {
        const allActivity = documents.flatMap(doc =>
            doc.activity.map(activity => ({
                ...activity,
                documentName: doc.name,
                documentId: doc.id,
            }))
        );

        return allActivity
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    };

    const isDataLoaded = (): boolean => !loading;
    const updateAppState = (): void => setUpdateState(prev => !prev)
    const restartApp = (): void => {
        setRestartTick((n) => n + 1);
    };

    const retrieveData = async (): Promise<void> => {
        try {
            const storedUser = getStoredValue("user");
            const storedTokens = getStoredValue("tokens");

            if (storedUser !== null && storedTokens !== null) {
                await login({ userData: storedUser, tokensData: storedTokens });
            }
        } catch {
            throw new Error("retrieveData failed");
        }
    };

    useEffect(() => {
        let isCancelled = false;

        const run = async () => {
            try {
                // показываем сплэш заново при каждом «рестарте»
                setLoading(true);

                await initStore();
                await retrieveData();

                const initResp = await sendDefaultRequest<InitResponse>({
                    url: `${SERVER_AJAX_URL}/init.php`,
                    showOptions: { error: false, success: false },
                });

                if (isCancelled) return;

                if (isAuthenticated() && !initResp.userAvailable) {
                    Toast.show({
                        type: "error",
                        text1: "Произошла ошибка, токен недействителен",
                    });
                    await logout();
                } else if (initResp.userAvailable && initResp.user) {
                    await login({ userData: initResp.user, tokensData: initResp.tokens });
                }
            } catch (err) {
                Toast.show({
                    type: "error",
                    text1: "Произошла ошибка, проверьте подключение к интернету",
                });
            } finally {
                if (isCancelled) return;
                setTimeout(() => setLoading(false), 500);
            }
        };

        run();

        return () => {
            isCancelled = true;
        };
    }, [restartTick]);

    return (
        <DataContext.Provider value={{
            documents,
            uiPreferences,
            restartApp,
            updateAppState,
            isDataLoaded,
            addDocument,
            deleteDocument,
            signDocument,
            shareDocument,
            logEvent,
            updateDocument,
            updateUIPreferences,
            getDocumentById,
            getRecentActivity,
        }}>
            {loading && (
                <View style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <Text style={{color: "white", fontSize: 28}}>
                        Загрузка...
                    </Text>
                </View>
            )}
            {!loading && children}
        </DataContext.Provider>
    );
}

export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}