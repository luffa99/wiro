import { NdefListenerOptions, NfcApi, NfcNdefData, NfcNdefRecord, NfcTagData, WriteTagOptions } from "./nfc.common";
export declare class NfcIntentHandler {
    savedIntent: android.content.Intent;
    constructor();
    parseMessage(): void;
    byteArrayToJSArray(bytes: any): Array<number>;
    byteArrayToJSON(bytes: any): string;
    bytesToHexString(bytes: any): string;
    bytesToString(bytes: any): string;
    techListToJSON(tag: any): Array<string>;
    ndefToJSON(ndef: android.nfc.tech.Ndef): NfcNdefData;
    messageToJSON(message: android.nfc.NdefMessage): Array<NfcNdefRecord>;
    recordToJSON(record: android.nfc.NdefRecord): NfcNdefRecord;
}
export declare const nfcIntentHandler: NfcIntentHandler;
export declare class Nfc implements NfcApi {
    private pendingIntent;
    private intentFilters;
    private techLists;
    private static firstInstance;
    private created;
    private started;
    private intent;
    private nfcAdapter;
    constructor();
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<any>;
    setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<any>;
    eraseTag(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    private initNfcAdapter;
    private static writeNdefMessage;
    private jsonToNdefRecords;
    private static stringToBytes;
}
