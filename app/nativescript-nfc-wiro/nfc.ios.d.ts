import { NdefListenerOptions, NfcApi, NfcNdefData, NfcTagData, WriteTagOptions } from "./nfc.common";
export interface NfcSessionInvalidator {
    invalidateSession(): void;
}
export declare class Nfc implements NfcApi, NfcSessionInvalidator {
    private session;
    private delegate;
    private static _available;
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<any>;
    setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<any>;
    invalidateSession(): void;
    stopListening(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    eraseTag(): Promise<any>;
}
