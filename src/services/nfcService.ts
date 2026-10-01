/**
 * NFCService - Abstraction layer for NFC hardware and simulation
 * 
 * Separates the web UI from physical NFC reader implementations:
 * 1. Web NFC API (NDEFReader) when running on compatible mobile/tablet browsers
 * 2. USB / Bluetooth HID Keyboard Wedge RFID/NFC readers (common plug-and-play hardware)
 * 3. Software Simulator / Manual Input for development and testing
 */

export type NFCCardCallback = (uid: string) => void;
export type NFCMode = 'web-nfc' | 'keyboard-wedge' | 'simulated';

class NFCService {
  private listeners: Set<NFCCardCallback> = new Set();
  private isScanning = false;
  private isConnected = true;
  private currentMode: NFCMode = 'simulated';
  private ndefReader: any = null;
  private abortController: AbortController | null = null;
  private audioCtx: AudioContext | null = null;

  // Keyboard wedge buffer for USB RFID readers
  private keyBuffer = '';
  private lastKeyTime = 0;
  private keyListenerAttached = false;

  constructor() {
    this.checkWebNFCSupport();
    this.initKeyboardWedge();
  }

  /**
   * Check if browser supports standard Web NFC API (e.g., Chrome on Android)
   */
  public isWebNFCSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window;
  }

  private checkWebNFCSupport() {
    if (this.isWebNFCSupported()) {
      this.currentMode = 'web-nfc';
    } else {
      this.currentMode = 'simulated';
    }
  }

  /**
   * Subscribe to card detection events
   */
  public onCardDetected(callback: NFCCardCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public removeCardListener(callback: NFCCardCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * Emit card detected to all registered listeners
   */
  public emitCardDetected(uid: string): void {
    const cleanUid = uid.trim().toUpperCase();
    if (!cleanUid) return;
    this.listeners.forEach((callback) => {
      try {
        callback(cleanUid);
      } catch (err) {
        console.error('Error in NFC callback:', err);
      }
    });
  }

  /**
   * Connect to NFC reader hardware
   */
  public async connect(): Promise<boolean> {
    this.isConnected = true;
    return true;
  }

  /**
   * Disconnect from NFC reader
   */
  public disconnect(): void {
    this.stopScanning();
    this.isConnected = false;
  }

  /**
   * Start scanning for NFC cards
   */
  public async startScanning(): Promise<boolean> {
    if (!this.isConnected) {
      await this.connect();
    }
    this.isScanning = true;

    if (this.isWebNFCSupported() && this.currentMode === 'web-nfc') {
      try {
        const NDEFReaderClass = (window as any).NDEFReader;
        this.ndefReader = new NDEFReaderClass();
        this.abortController = new AbortController();

        await this.ndefReader.scan({ signal: this.abortController.signal });

        this.ndefReader.onreading = (event: any) => {
          const serialNumber = event.serialNumber || (event.message?.records?.[0]?.data ? 'NFC-' + Math.random().toString(36).substring(2, 8).toUpperCase() : '');
          if (serialNumber) {
            this.emitCardDetected(serialNumber);
          }
        };

        this.ndefReader.onreadingerror = () => {
          console.warn('Error reading NFC card with Web NFC');
        };
      } catch (err) {
        console.warn('Web NFC scan error, falling back to simulated/wedge mode:', err);
        this.currentMode = 'simulated';
      }
    }

    return true;
  }

  /**
   * Stop scanning
   */
  public stopScanning(): void {
    this.isScanning = false;
    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch (e) {
        // ignore
      }
      this.abortController = null;
    }
  }

  /**
   * Set operational mode (web-nfc, keyboard-wedge, simulated)
   */
  public setMode(mode: NFCMode): void {
    this.currentMode = mode;
  }

  public getMode(): NFCMode {
    return this.currentMode;
  }

  public getStatus() {
    return {
      isWebNFCSupported: this.isWebNFCSupported(),
      isConnected: this.isConnected,
      isScanning: this.isScanning,
      mode: this.currentMode,
      error: null as string | null,
    };
  }

  /**
   * Hardware USB RFID/NFC reader wedge listener.
   * Most commercial USB RFID/NFC scanners act as a keyboard that rapidly types
   * the card UID (hex or decimal digits) in < 50ms and presses Enter.
   */
  private initKeyboardWedge(): void {
    if (typeof window === 'undefined' || this.keyListenerAttached) return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      // If the user is currently typing in an input or textarea, don't capture unless it's a dedicated scanner
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      const now = Date.now();
      const timeDiff = now - this.lastKeyTime;

      // Reset buffer if delay between keystrokes is too long (human typing vs hardware reader)
      if (timeDiff > 250) {
        this.keyBuffer = '';
      }

      this.lastKeyTime = now;

      if (e.key === 'Enter') {
        const buffered = this.keyBuffer.trim();
        // If we received 4+ characters rapidly without active form input (or marked as RFID)
        if (buffered.length >= 4 && !isInput) {
          e.preventDefault();
          this.emitCardDetected(buffered);
          this.keyBuffer = '';
        } else {
          this.keyBuffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        this.keyBuffer += e.key;
      }
    });

    this.keyListenerAttached = true;
  }

  /**
   * Simulate a physical NFC card swipe
   */
  public triggerCard(uid: string): void {
    this.emitCardDetected(uid);
  }

  /**
   * High quality web audio chime for pleasant feedback
   */
  public playFeedbackSound(type: 'success' | 'warning' | 'error' | 'click' = 'success'): void {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'success') {
        // High, cheerful ascending chime (D5 -> A5)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

        osc2.frequency.setValueAtTime(1174.66, now); // D6
        osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.12); // A6

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
      } else if (type === 'warning') {
        // Double gentle knock / alert
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(349, now + 0.1);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.05, now + 0.09);
        gain.gain.setValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.32);
      } else if (type === 'error') {
        // Low soft buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.25);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      // Audio might be blocked before first interaction
    }
  }
}

export const nfcService = new NFCService();
