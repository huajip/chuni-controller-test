import { TasollerOptionsProtocol } from "./tasoller-options-protocol.js?v=20260424-1";

import { encodeEpassCardId } from "./card-cipher.js";
import { decodeSpad0AccessCode } from "./spad0.js";

const VENDOR_TASOLLER = 0x1ccf;
const PRODUCT_TASOLLER = 0x2333;
const VENDOR_TASOLLER_PLUS = 0x0e8f;
const PRODUCT_TASOLLER_PLUS = 0x1231;
const PRODUCT_TASOLLER_PLUS_32K = 0x1232;
const PRODUCT_TASOLLER_PLUS_16K = 0x1233;
const PRODUCT_TASOLLER_PLUS_8K = 0x1234;
const PRODUCT_TASOLLER_PLUS_4K = 0x1235;
const VENDOR_YUBIDECK = 0x1973;
const PRODUCT_YUBIDECK = 0x2001;
const VENDOR_SEGA_IO4 = 0x0ca3;
const PRODUCT_SEGA_IO4 = 0x0021;
const SLIDER_SYNC = 0xff;
const SLIDER_MARK = 0xfd;
const SLIDER_MARKED_SYNC = 0xfe;
const SLIDER_MARKED_MARK = 0xfc;
const SLIDER_CMD_LED = 0x02;
const SLIDER_CMD_REPORT_ENABLE = 0x03;
const SLIDER_CMD_REPORT_DISABLE = 0x04;
const SLIDER_TX_REPORT = 0x01;
const SLIDER_TX_REPORT_DISABLE = 0x04;
const LIGHT_LOOP_INTERVAL_MS = 16;
const LIGHT_KEEPALIVE_MS = 500;
const TASOLLER_LIGHT_WARMUP_MS = 1000;
const TOUCH_COM_RELEASE_HOLD_MS = 400;
const TOUCH_COM_EMPTY_PACKET_HOLD_MS = 5000;
const TOUCH_THRESHOLD_STORAGE_KEY = "controller-test-touch-threshold";
const LANGUAGE_STORAGE_KEY = "controller-test-language";
const AIME_READER_DEFAULT_BAUD = 115200;
const AIME_READER_SCAN_DURATION_MS = 10000;
const AIME_READER_SCAN_POLL_INTERVAL_MS = 500;
const AIME_READER_LED_BLINK_MS = 1000;
const AIME_READER_DEBUG_LOG = false;
const SG_SYNC = 0xe0;
const SG_ESCAPE = 0xd0;
const SG_NFC_ADDR = 0x00;
const SG_LED_ADDR = 0x08;
const SG_CMD_GET_FW_VERSION = 0x30;
const SG_CMD_GET_HW_VERSION = 0x32;
const SG_CMD_RADIO_ON = 0x40;
const SG_CMD_POLL = 0x42;
const SG_CMD_MIFARE_SELECT_TAG = 0x43;
const SG_CMD_MIFARE_SET_KEY_A = 0x50;
const SG_CMD_MIFARE_AUTHENTICATE_A = 0x51;
const SG_CMD_MIFARE_READ_BLOCK = 0x52;
const SG_CMD_MIFARE_SET_KEY_B = 0x54;
const SG_CMD_MIFARE_AUTHENTICATE_B = 0x55;
const SG_CMD_RESET = 0x62;
const SG_CMD_FELICA_ENCAP = 0x71;
const SG_LED_CMD_SET_COLOR = 0x81;
const SG_LED_CMD_RESET = 0xf5;
const SG_LED_CMD_GET_INFO = 0xf0;
const HINATA_VENDOR_ID = 0xf822;
const HINATA_REPORT_ID = 0x01;
const HINATA_CMD_PN532 = 0xe2;
const HINATA_CMD_FW = 0x01;
const FELICA_CMD_READ_WITHOUT_ENCRYPTION = 0x06;
const FELICA_CMD_READ_WITHOUT_ENCRYPTION_RESPONSE = 0x07;
const FELICA_LITES_READ_ONLY_SERVICE = 0x000b;
const AICC_FELICA_MANUFACTURER = [0x01, 0x2e];
const AICC_FELICA_SUPPORTED_OS_VERSIONS = new Set([
  0x06, 0x07, 0x10, 0x12, 0x13, 0x14, 0x15, 0x17, 0x18,
  0x20, 0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7,
]);
const PN532_HOST_TO_DEVICE = 0xd4;
const PN532_DEVICE_TO_HOST = 0xd5;
const PN532_CMD_GET_FIRMWARE_VERSION = 0x02;
const PN532_CMD_SAM_CONFIGURATION = 0x14;
const PN532_CMD_IN_DATA_EXCHANGE = 0x40;
const PN532_CMD_IN_LIST_PASSIVE_TARGET = 0x4a;
const DEFAULT_LOCALE = "en-us";
const SUPPORTED_LOCALES = ["zh-hk", "zh-cn", "zh-tw", "en-us", "ko-kr", "ja-jp"];
const TASOLLER_OPTIONS_DBT_TRIGGER_PAYLOAD = Uint8Array.from([
  0x68, 0xdd, 0xc8, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
]);

const TASOLLER_PLUS_PRODUCT_IDS = [
  PRODUCT_TASOLLER_PLUS,
  PRODUCT_TASOLLER_PLUS_4K,
  PRODUCT_TASOLLER_PLUS_8K,
  PRODUCT_TASOLLER_PLUS_16K,
  PRODUCT_TASOLLER_PLUS_32K,
];

const state = {
  slider: Array(32).fill(0),
  air: Array(6).fill(0),
  buttons: [],
  optionsAir: Array(6).fill(null),
  optionsSlider: Array(32).fill(0),
  optionsButtons: [],
  cardStatus: 0,
  cardId: [],
  optionsLog: [],
  lastOptionsSummaryKey: "",
  lastOptionsReportByHead: new Map(),
  activeSliderLeds: Array(31).fill(false),
  touchComHeldSlider: Array(32).fill(0),
  touchComZeroFrames: Array(32).fill(0),
  touchComLastActiveAt: Array(32).fill(0),
  lastTouchComNonEmptyAt: 0,
  raw: {},
  connectionKey: "status.disconnected",
  connectionText: "",
  lightStatusKey: "status.ready",
  lightStatusText: "",
  touchComStatusKey: "touch.status.disconnected",
  touchComStatusText: "",
  aimeReaderStatusKey: "aime.status.disconnected",
  aimeReaderStatusText: "",
  aimeReaderLog: [],
  aimeLookupSeq: 0,
  optionsStatusKey: "status.idle",
  optionsStatusText: "",
  lightMode: "active",
};

const i18n = {
  locale: DEFAULT_LOCALE,
  messages: {},
};

const ui = {
  sliderCells: [],
  airCells: [],
  optionsSliderCells: [],
  buttonIndicators: [],
  optionsAirCells: [],
  optionsButtonIndicators: [],
  buttonStack: document.querySelector("#button-stack"),
  optionsButtonStack: document.querySelector("#options-button-stack"),
  buttonTemplate: document.querySelector("#button-indicator-template"),
  lightStatus: document.querySelector("#light-status"),
  cardLightControl: document.querySelector("#card-light-control"),
  yubideckCardPanel: document.querySelector("#yubideck-card-panel"),
  cardTestStatus: document.querySelector("#card-test-status"),
  cardStatusValue: document.querySelector("#card-status-value"),
  cardIdValue: document.querySelector("#card-id-value"),
  colorSlider: document.querySelector("#color-slider"),
  colorSliderActive: document.querySelector("#color-slider-active"),
  touchThreshold: document.querySelector("#touch-threshold"),
  touchThresholdRange: document.querySelector("#touch-threshold-range"),
  colorGap: document.querySelector("#color-gap"),
  gapMode: document.querySelector("#gap-mode"),
  colorLeftAir: document.querySelector("#color-left-air"),
  colorRightAir: document.querySelector("#color-right-air"),
  colorCard: document.querySelector("#color-card"),
  connectionStatus: document.querySelector("#connection-status"),
  deviceName: document.querySelector("#device-name"),
  activeSummary: document.querySelector("#active-summary"),
  optionsPanel: document.querySelector("#options-panel"),
  optionsStatus: document.querySelector("#options-status"),
  optionsInterfaceValue: document.querySelector("#options-interface-value"),
  optionsEndpointsValue: document.querySelector("#options-endpoints-value"),
  optionsModeValue: document.querySelector("#options-mode-value"),
  optionsUseHid: document.querySelector("#options-use-hid"),
  optionsUseUsb: document.querySelector("#options-use-usb"),
  optionsPollHid: document.querySelector("#options-poll-hid"),
  optionsTriggerDbt: document.querySelector("#options-trigger-dbt"),
  optionsStop: document.querySelector("#options-stop"),
  optionsRestart: document.querySelector("#options-restart"),
  optionsClear: document.querySelector("#options-clear"),
  optionsLog: document.querySelector("#options-log"),
  optionsActiveSummary: document.querySelector("#options-active-summary"),
  touchComStatus: document.querySelector("#touch-com-status"),
  aimeReaderStatus: document.querySelector("#aime-reader-status"),
  aimeReaderMode: document.querySelector("#aime-reader-mode"),
  aimeReaderBaud: document.querySelector("#aime-reader-baud"),
  aimeReaderLedColor: document.querySelector("#aime-reader-led-color"),
  aimeReaderLedBrightness: document.querySelector("#aime-reader-led-brightness"),
  aimeReaderLedBrightnessValue: document.querySelector("#aime-reader-led-brightness-value"),
  aimeReaderFw: document.querySelector("#aime-reader-fw"),
  aimeReaderHw: document.querySelector("#aime-reader-hw"),
  aimeCardType: document.querySelector("#aime-card-type"),
  aimeCardValue: document.querySelector("#aime-card-value"),
  aimeReaderLog: document.querySelector("#aime-reader-log"),
  languageSelect: document.querySelector("#language-select"),
};

window.TasollerOptionsProtocol = TasollerOptionsProtocol;

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_match, key) =>
    params[key] === undefined ? `{${key}}` : String(params[key])
  );
}

function t(key, params = {}) {
  return interpolate(i18n.messages[key] ?? key, params);
}

async function loadLocale(locale) {
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  const response = await fetch(`./locales/${normalized}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load locale ${normalized}`);
  }
  i18n.locale = normalized;
  i18n.messages = await response.json();
  document.documentElement.lang = normalized;
  ui.languageSelect.value = normalized;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = t("app.title");
  updateTranslatedStatuses();
  render();
  renderOptionsLog();
  renderAimeReaderLog();
}

function updateTranslatedStatuses() {
  if (state.connectionKey) {
    ui.connectionStatus.textContent = t(state.connectionKey);
  } else if (state.connectionText) {
    ui.connectionStatus.textContent = state.connectionText;
  }

  if (state.lightStatusKey) {
    ui.lightStatus.textContent = t(state.lightStatusKey);
  } else if (state.lightStatusText) {
    ui.lightStatus.textContent = state.lightStatusText;
  }

  if (state.touchComStatusKey) {
    ui.touchComStatus.textContent = t(state.touchComStatusKey);
  } else if (state.touchComStatusText) {
    ui.touchComStatus.textContent = state.touchComStatusText;
  }

  if (state.aimeReaderStatusKey) {
    ui.aimeReaderStatus.textContent = t(state.aimeReaderStatusKey);
  } else if (state.aimeReaderStatusText) {
    ui.aimeReaderStatus.textContent = state.aimeReaderStatusText;
  }

  if (state.optionsStatusKey) {
    ui.optionsStatus.textContent = t(state.optionsStatusKey);
  } else if (state.optionsStatusText) {
    ui.optionsStatus.textContent = state.optionsStatusText;
  }
}

function isTasollerPlusFamily(device) {
  return device?.vendorId === VENDOR_TASOLLER_PLUS &&
    TASOLLER_PLUS_PRODUCT_IDS.includes(device.productId);
}

function tasollerPlusNameForPid(productId) {
  switch (productId) {
    case PRODUCT_TASOLLER_PLUS:
      return "Tasoller Plus (WinUSB)";
    case PRODUCT_TASOLLER_PLUS_4K:
      return "Tasoller Plus (4K Keyboard)";
    case PRODUCT_TASOLLER_PLUS_8K:
      return "Tasoller Plus (8K Keyboard)";
    case PRODUCT_TASOLLER_PLUS_16K:
      return "Tasoller Plus (16K Keyboard)";
    case PRODUCT_TASOLLER_PLUS_32K:
      return "Tasoller Plus (32K Keyboard)";
    default:
      return `Tasoller Plus (${productId.toString(16)})`;
  }
}

function tasollerPlusModeLabel(productId) {
  switch (productId) {
    case PRODUCT_TASOLLER_PLUS:
      return "WinUSB";
    case PRODUCT_TASOLLER_PLUS_4K:
      return "4K Keyboard";
    case PRODUCT_TASOLLER_PLUS_8K:
      return "8K Keyboard";
    case PRODUCT_TASOLLER_PLUS_16K:
      return "16K Keyboard";
    case PRODUCT_TASOLLER_PLUS_32K:
      return "32K Keyboard";
    default:
      return "-";
  }
}

function tasollerPlusModeValueForPid(productId) {
  switch (productId) {
    case PRODUCT_TASOLLER_PLUS:
      return 0;
    case PRODUCT_TASOLLER_PLUS_4K:
      return 1;
    case PRODUCT_TASOLLER_PLUS_8K:
      return 2;
    case PRODUCT_TASOLLER_PLUS_16K:
      return 3;
    case PRODUCT_TASOLLER_PLUS_32K:
      return 4;
    default:
      return 0;
  }
}

function productIdForModeValue(modeValue) {
  switch (modeValue) {
    case 0:
      return PRODUCT_TASOLLER_PLUS;
    case 1:
      return PRODUCT_TASOLLER_PLUS_4K;
    case 2:
      return PRODUCT_TASOLLER_PLUS_8K;
    case 3:
      return PRODUCT_TASOLLER_PLUS_16K;
    case 4:
      return PRODUCT_TASOLLER_PLUS_32K;
    default:
      return PRODUCT_TASOLLER_PLUS;
  }
}

function hidDeviceHasVendorOptionsCollection(device) {
  return (device?.collections ?? []).some(
    (collection) => collection.usagePage === 0xff00 && collection.usage === 0x01
  );
}

class DeviceAdapter {
  constructor(name) {
    this.name = name;
    this.connected = false;
  }

  getButtonLayout() {
    return [];
  }

  hasCardLight() {
    return false;
  }

  canStreamLights() {
    return true;
  }

  wantsContinuousLightRefresh() {
    return false;
  }

  wantsInputDrivenLightRefresh() {
    return false;
  }

  supportsOptionsTest() {
    return false;
  }

  getOptionsInfo() {
    return null;
  }

  setConnected(value) {
    this.connected = value;
  }

  async disconnect() {
    this.setConnected(false);
  }

  async restartOptionsMonitor() {
  }

  async startOptionsWebHid() {
  }

  async startOptionsWebUsb() {
  }

  async pollOptions() {
  }

  async triggerOptionsDbt() {
  }

  async stopOptionsMonitor() {
  }

  async writeLights(_lighting) {
    throw new Error(t("error.noLightOutput"));
  }
}

class YubiDeckWebHidAdapter extends DeviceAdapter {
  constructor() {
    super("YubiDeck");
    this.device = null;
    this.handleInputReport = (event) => {
      const bytes = new Uint8Array(event.data.buffer);
      if (bytes.length < 45) {
        return;
      }

      const slider = Array.from(bytes.slice(2, 34));
      applyControllerState({
        buttons: [
          (bytes[1] & 0x04) !== 0,
          (bytes[1] & 0x02) !== 0,
          (bytes[1] & 0x01) !== 0,
        ],
        air: decodeAirBits(bytes[0]),
        slider,
        cardStatus: bytes[34] ?? 0,
        cardId: Array.from(bytes.slice(35, 45)),
        raw: {
          reportId: event.reportId,
          irValue: bytes[0],
          spButtons: bytes[1],
          touchValue: slider,
          cardStatus: bytes[34] ?? 0,
          cardId: Array.from(bytes.slice(35, 45)),
        },
      });
    };
  }

  getButtonLayout() {
    return ["A", "B", "C"];
  }

  hasCardLight() {
    return true;
  }

  async connect() {
    if (!("hid" in navigator)) {
      throw new Error(t("error.webhidUnsupported"));
    }

    let device = this.device;
    if (!device) {
      const selected = await navigator.hid.requestDevice({
        filters: [{ vendorId: VENDOR_YUBIDECK, productId: PRODUCT_YUBIDECK }],
      });
      [device] = selected;
    }

    if (!device) {
      throw new Error(t("error.noYubideck"));
    }

    this.device = device;
    await this.device.open();
    this.device.addEventListener("inputreport", this.handleInputReport);
    this.setConnected(true);
  }

  async disconnect() {
    if (this.device) {
      this.device.removeEventListener("inputreport", this.handleInputReport);
      if (this.device.opened) {
        await this.device.close();
      }
      this.device = null;
    }

    await super.disconnect();
  }

  async writeLights(lighting) {
    if (!this.device || !this.device.opened) {
      throw new Error(t("error.yubideckNotConnected"));
    }

    const packet0 = new Uint8Array(61);
    packet0[0] = 0;
    for (let index = 0; index < 20; index++) {
      const base = 1 + index * 3;
      const color = lighting.slider[index];
      packet0[base + 0] = color.r;
      packet0[base + 1] = color.g;
      packet0[base + 2] = color.b;
    }

    const packet1 = new Uint8Array(61);
    packet1[0] = 1;
    for (let index = 0; index < 11; index++) {
      const base = 1 + index * 3;
      const color = lighting.slider[index + 20];
      packet1[base + 0] = color.r;
      packet1[base + 1] = color.g;
      packet1[base + 2] = color.b;
    }

    packet1[34] = lighting.leftAir.r;
    packet1[35] = lighting.leftAir.g;
    packet1[36] = lighting.leftAir.b;
    packet1[37] = lighting.rightAir.r;
    packet1[38] = lighting.rightAir.g;
    packet1[39] = lighting.rightAir.b;
    packet1[40] = lighting.card.r;
    packet1[41] = lighting.card.g;
    packet1[42] = lighting.card.b;

    await this.device.sendReport(0, packet0);
    await this.device.sendReport(0, packet1);
  }
}

class TasollerWebUsbAdapter extends DeviceAdapter {
  constructor({ name, vendorId, productId, buttonLayout, parseInput }) {
    super(name);
    this.vendorId = vendorId;
    this.productId = productId;
    this.buttonLayout = buttonLayout;
    this.parseInput = parseInput;
    this.device = null;
    this.readLoopPromise = null;
    this.lightWarmupUntil = 0;
  }

  getButtonLayout() {
    return this.buttonLayout;
  }

  wantsContinuousLightRefresh() {
    return true;
  }

  wantsInputDrivenLightRefresh() {
    return true;
  }

  async connect() {
    if (!("usb" in navigator)) {
      throw new Error(t("error.webusbUnsupported"));
    }

    let device = this.device;
    if (!device) {
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: this.vendorId, productId: this.productId }],
      });
    }

    if (!device) {
      throw new Error(`No ${this.name} device was selected`);
    }

    this.device = device;
    await this.device.open();

    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    await this.device.claimInterface(0);
    this.setConnected(true);
    this.lightWarmupUntil = performance.now() + TASOLLER_LIGHT_WARMUP_MS;
    this.readLoopPromise = this.readLoop();
  }

  async readLoop() {
    while (this.connected && this.device) {
      try {
        const result = await this.device.transferIn(4, 36);
        if (result.status !== "ok" || !result.data) {
          continue;
        }

        const bytes = new Uint8Array(
          result.data.buffer.slice(0, result.data.byteLength)
        );
        const parsed = this.parseInput(bytes);
        if (parsed) {
          applyControllerState(parsed);
        }
        if (this.wantsInputDrivenLightRefresh()) {
          const mode = performance.now() < this.lightWarmupUntil
            ? "solid"
            : state.lightMode;
          await this.writeLights(buildLightingPayload(mode));
        }
      } catch (error) {
        if (this.connected) {
          setStatus(`Failed to read ${this.name}: ${error.message}`, true);
        }
        break;
      }
    }

    this.setConnected(false);
  }

  async disconnect() {
    this.setConnected(false);

    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise;
      } catch (_error) {
      }
      this.readLoopPromise = null;
    }

    if (this.device) {
      try {
        await this.device.releaseInterface(0);
      } catch (_error) {
      }

      if (this.device.opened) {
        await this.device.close();
      }

      this.device = null;
    }

    await super.disconnect();
  }

  async writeLights(lighting) {
    if (!this.device || !this.device.opened) {
      throw new Error(`${this.name} is not connected`);
    }

    const packet = this.buildLightPacket(lighting);
    const result = await this.device.transferOut(3, packet);
    if (result.status !== "ok") {
      throw new Error(`transferOut returned ${result.status}`);
    }
  }

  buildLightPacket(_lighting) {
    return new Uint8Array();
  }
}

class TasollerV1WebUsbAdapter extends TasollerWebUsbAdapter {
  buildLightPacket(lighting) {
    const packet = new Uint8Array(240);
    packet[0] = 0x42;
    packet[1] = 0x4c;
    packet[2] = 0x00;

    for (let index = 0; index < 31; index++) {
      const base = 3 + index * 3;
      const color = lighting.slider[index];
      packet[base + 0] = color.g;
      packet[base + 1] = color.r;
      packet[base + 2] = color.b;
    }

    for (let index = 0; index < 24; index++) {
      const leftBase = 96 + index * 3;
      const rightBase = 168 + index * 3;
      packet[leftBase + 0] = lighting.leftAir.g;
      packet[leftBase + 1] = lighting.leftAir.r;
      packet[leftBase + 2] = lighting.leftAir.b;
      packet[rightBase + 0] = lighting.rightAir.g;
      packet[rightBase + 1] = lighting.rightAir.r;
      packet[rightBase + 2] = lighting.rightAir.b;
    }

    return packet;
  }
}

class TasollerPlusWebUsbAdapter extends TasollerWebUsbAdapter {
  constructor(options) {
    super(options);
    this.usbInputReady = false;
    this.optionsTransport = null;
    this.optionsInterfaceNumber = null;
    this.optionsInEndpointNumber = null;
    this.optionsOutEndpointNumber = null;
    this.optionsPacketSize = 65;
    this.optionsInterfaceClass = null;
    this.optionsInterfaceSubclass = null;
    this.optionsInterfaceProtocol = null;
    this.optionsHidDevice = null;
    this.optionsReadLoopPromise = null;
    this.optionsMonitoring = false;
    this.handleOptionsHidReport = (event) => {
      const rawBytes = new Uint8Array(event.data.buffer);
      const bytes = event.reportId === 0
        ? new Uint8Array([0x00, ...rawBytes])
        : rawBytes;
      appendOptionsDelta(bytes, {
        interfaceNumber: "hid",
        endpointNumber: event.reportId,
      });

      const dbtParsed = parseTasollerOptionsDbt(bytes);
      if (dbtParsed) {
        applyOptionsControllerState(dbtParsed);
        appendOptionsSummary(dbtParsed.summaryKey, dbtParsed.summary);
        return;
      }

      const dbtAnalogParsed = parseTasollerOptionsAnalog(bytes);
      if (dbtAnalogParsed) {
        applyOptionsControllerState(dbtAnalogParsed);
        appendOptionsSummary(dbtAnalogParsed.summaryKey, dbtAnalogParsed.summary);
        return;
      }

      const optionsNonzeroParsed = parseTasollerOptionsNonzero(bytes);
      if (optionsNonzeroParsed) {
        applyOptionsControllerState(optionsNonzeroParsed);
        appendOptionsSummary(optionsNonzeroParsed.summaryKey, optionsNonzeroParsed.summary);
        return;
      }

      if (isTasollerOptionsIdleFrame(bytes)) {
        return;
      }

      const parsed = parseTasollerPlusInput(bytes);
      if (parsed) {
        applyOptionsControllerState(parsed);
      }
      const packetHex = formatHex(bytes);
      if (!this.lastOptionsPacketHex || this.lastOptionsPacketHex !== packetHex) {
        this.lastOptionsPacketHex = packetHex;
        appendOptionsPacket(bytes, {
          interfaceNumber: "hid",
          endpointNumber: event.reportId,
        });
      }
    };
  }

  supportsOptionsTest() {
    return true;
  }

  canStreamLights() {
    return this.usbInputReady;
  }

  getOptionsInfo() {
    if (this.optionsTransport === "webhid" && this.optionsHidDevice?.opened) {
      return {
        transport: "webhid",
        interfaceNumber: null,
        inEndpoint: null,
        outEndpoint: null,
        packetSize: this.optionsPacketSize,
        interfaceClass: this.optionsInterfaceClass,
        subclass: this.optionsInterfaceSubclass,
        protocol: this.optionsInterfaceProtocol,
      };
    }

    if (this.optionsInterfaceNumber === null || this.optionsInEndpointNumber === null) {
      return null;
    }

    return {
      transport: this.optionsTransport,
      interfaceNumber: this.optionsInterfaceNumber,
      inEndpoint: this.optionsInEndpointNumber,
      outEndpoint: this.optionsOutEndpointNumber,
      packetSize: this.optionsPacketSize,
      interfaceClass: this.optionsInterfaceClass,
      subclass: this.optionsInterfaceSubclass,
      protocol: this.optionsInterfaceProtocol,
    };
  }

  async connect() {
    if (this.productId === PRODUCT_TASOLLER_PLUS) {
      await super.connect();
      this.usbInputReady = true;
    } else {
      if (!("usb" in navigator)) {
        throw new Error(t("error.webusbUnsupported"));
      }

      let device = this.device;
      if (!device) {
        device = await navigator.usb.requestDevice({
          filters: TASOLLER_PLUS_PRODUCT_IDS.map((productId) => ({
            vendorId: this.vendorId,
            productId,
          })),
        });
      }

      if (!device) {
        throw new Error(`No ${this.name} device was selected`);
      }

      this.device = device;
      await this.device.open();
      if (this.device.configuration === null) {
        await this.device.selectConfiguration(1);
      }
      this.setConnected(true);
      this.usbInputReady = false;
      setStatus(`${this.name}: WebUSB input unavailable in keyboard/HID mode; use TASOLLER Options / WebHID`, true);
    }

    updateOptionsControls();
    setOptionsStatusKey("options.status.modeDetected");
  }

  async disconnect() {
    this.optionsMonitoring = false;

    if (this.optionsHidDevice) {
      try {
        this.optionsHidDevice.removeEventListener("inputreport", this.handleOptionsHidReport);
      } catch (_error) {
      }
      try {
        if (this.optionsHidDevice.opened) {
          await this.optionsHidDevice.close();
        }
      } catch (_error) {
      }
      this.optionsHidDevice = null;
    }

    await super.disconnect();

    if (this.optionsReadLoopPromise) {
      try {
        await this.optionsReadLoopPromise;
      } catch (_error) {
      }
      this.optionsReadLoopPromise = null;
    }

    this.optionsTransport = null;
    this.usbInputReady = false;
    this.optionsInterfaceNumber = null;
    this.optionsInEndpointNumber = null;
    this.optionsOutEndpointNumber = null;
    this.optionsPacketSize = 65;
    this.optionsInterfaceClass = null;
    this.optionsInterfaceSubclass = null;
    this.optionsInterfaceProtocol = null;
  }

  async restartOptionsMonitor() {
    if (this.optionsTransport === "webusb") {
      return this.startOptionsWebUsb();
    }

    return this.startOptionsWebHid();
  }

  async startOptionsWebUsb() {
    this.optionsMonitoring = false;
    if (this.optionsReadLoopPromise) {
      try {
        await this.optionsReadLoopPromise;
      } catch (_error) {
      }
      this.optionsReadLoopPromise = null;
    }

    if (!this.device || !this.device.opened) {
      throw new Error(t("error.tasollerPlusNotConnected"));
    }

    await this.claimOptionsInterface();
    if (this.optionsInEndpointNumber === null) {
      throw new Error(t("error.noOptionsWebusb"));
    }

    this.optionsTransport = "webusb";
    this.optionsMonitoring = true;
    setOptionsStatusKey("options.status.monitoringWebUsb");
    this.optionsReadLoopPromise = this.optionsReadLoop();
    updateOptionsControls();
  }

  async startOptionsWebHid() {
    this.optionsMonitoring = false;
    if (this.optionsReadLoopPromise) {
      try {
        await this.optionsReadLoopPromise;
      } catch (_error) {
      }
      this.optionsReadLoopPromise = null;
    }

    if (!this.device || !this.device.opened) {
      throw new Error(t("error.tasollerPlusNotConnected"));
    }

    await this.startOptionsHidMonitor();
  }

  async claimOptionsInterface() {
    const optionsInterface = this.findOptionsInterface();
    if (!optionsInterface) {
      this.optionsTransport = null;
      this.optionsInterfaceNumber = null;
      this.optionsInEndpointNumber = null;
      this.optionsOutEndpointNumber = null;
      this.optionsInterfaceClass = null;
      this.optionsInterfaceSubclass = null;
      this.optionsInterfaceProtocol = null;
      updateOptionsControls();
      return;
    }

    if (
      this.optionsInterfaceNumber === optionsInterface.interfaceNumber &&
      this.optionsInEndpointNumber === optionsInterface.inEndpointNumber
    ) {
      updateOptionsControls();
      return;
    }

    this.optionsInterfaceNumber = optionsInterface.interfaceNumber;
    this.optionsInEndpointNumber = optionsInterface.inEndpointNumber;
    this.optionsOutEndpointNumber = optionsInterface.outEndpointNumber;
    this.optionsPacketSize = optionsInterface.packetSize;
    this.optionsInterfaceClass = optionsInterface.interfaceClass;
    this.optionsInterfaceSubclass = optionsInterface.interfaceSubclass;
    this.optionsInterfaceProtocol = optionsInterface.interfaceProtocol;

    await this.device.claimInterface(optionsInterface.interfaceNumber);
    updateOptionsControls();
  }

  findOptionsInterface() {
    if (!this.device?.configuration?.interfaces) {
      return null;
    }

    for (const iface of this.device.configuration.interfaces) {
      if (iface.interfaceNumber === 0) {
        continue;
      }

      for (const alternate of iface.alternates ?? []) {
        const inEndpoint = alternate.endpoints?.find(
          (endpoint) => endpoint.direction === "in"
        );
        if (!inEndpoint) {
          continue;
        }

        const outEndpoint = alternate.endpoints?.find(
          (endpoint) => endpoint.direction === "out"
        );
        return {
          interfaceNumber: iface.interfaceNumber,
          inEndpointNumber: inEndpoint.endpointNumber,
          outEndpointNumber: outEndpoint?.endpointNumber ?? null,
          packetSize: inEndpoint.packetSize ?? 65,
          interfaceClass: alternate.interfaceClass ?? null,
          interfaceSubclass: alternate.interfaceSubclass ?? null,
          interfaceProtocol: alternate.interfaceProtocol ?? null,
        };
      }
    }

    return null;
  }

  async optionsReadLoop() {
    while (this.connected && this.device && this.optionsMonitoring) {
      try {
        const result = await this.device.transferIn(
          this.optionsInEndpointNumber,
          this.optionsPacketSize
        );
        if (result.status !== "ok" || !result.data) {
          continue;
        }

        const bytes = new Uint8Array(
          result.data.buffer.slice(0, result.data.byteLength)
        );
        appendOptionsPacket(bytes, {
          interfaceNumber: this.optionsInterfaceNumber,
          endpointNumber: this.optionsInEndpointNumber,
        });
      } catch (error) {
        if (this.connected && this.optionsMonitoring) {
          setOptionsStatus(t("options.status.monitorStopped", { message: error.message }));
        }
        break;
      }
    }

    this.optionsMonitoring = false;
  }

  async startOptionsHidMonitor({ monitor = true } = {}) {
    if (!("hid" in navigator)) {
      throw new Error(t("error.webhidUnsupported"));
    }

    let hidDevice = this.optionsHidDevice;
    if (hidDevice && !hidDeviceHasVendorOptionsCollection(hidDevice)) {
      hidDevice = null;
    }

    if (!hidDevice) {
      const knownDevices = await navigator.hid.getDevices();
      hidDevice = knownDevices.find(
        (device) => isTasollerPlusFamily(device) && hidDeviceHasVendorOptionsCollection(device)
      ) ?? null;
    }

    if (!hidDevice) {
      const selected = await navigator.hid.requestDevice({
        filters: TASOLLER_PLUS_PRODUCT_IDS.map((productId) => ({
          vendorId: this.vendorId,
          productId,
        })),
      });
      hidDevice = selected.find((device) => hidDeviceHasVendorOptionsCollection(device)) ?? null;
    }

    if (!hidDevice) {
      throw new Error(t("error.noOptionsHid"));
    }

    this.optionsHidDevice = hidDevice;
    if (!hidDevice.opened) {
      await hidDevice.open();
    }

    appendOptionsMessage(
      `WebHID device: ${hidDevice.productName || "unknown"}\n${summarizeHidCollections(hidDevice)}`
    );

    if (!hidDeviceHasVendorOptionsCollection(hidDevice)) {
      throw new Error(t("error.invalidOptionsHid"));
    }

    hidDevice.removeEventListener("inputreport", this.handleOptionsHidReport);
    if (monitor) {
      hidDevice.addEventListener("inputreport", this.handleOptionsHidReport);
    }

    this.optionsTransport = "webhid";
    this.optionsInterfaceNumber = null;
    this.optionsInEndpointNumber = null;
    this.optionsOutEndpointNumber = null;
    this.optionsInterfaceClass = 0x03;
    this.optionsInterfaceSubclass = null;
    this.optionsInterfaceProtocol = null;
    this.optionsMonitoring = monitor;
    setOptionsStatus(monitor
      ? "Options monitor connected."
      : "Options link connected.");
    updateOptionsControls();
  }

  async pollOptions() {
    if (this.optionsTransport === "webhid") {
      if (!this.optionsHidDevice || !this.optionsHidDevice.opened) {
        throw new Error(t("error.optionsHidNotReady"));
      }

      const payload = new Uint8Array(64);
      await this.optionsHidDevice.sendReport(0, payload);
      appendOptionsMessage("Sent WebHID poll report: id=0 len=64 (wire view = 65 bytes with synthetic leading 00)");
    setOptionsStatusKey("options.status.sentPoll");
      return;
    }

    throw new Error(t("error.optionsPollWebhidOnly"));
  }

  async triggerOptionsDbt() {
    if (this.optionsTransport !== "webhid" || !this.optionsHidDevice || !this.optionsHidDevice.opened) {
      await this.startOptionsWebHid();
    }

    await this.optionsHidDevice.sendReport(0, TASOLLER_OPTIONS_DBT_TRIGGER_PAYLOAD);
    appendOptionsMessage(
      `Sent WebHID DBT trigger: id=0 len=64 (wire view = 65 bytes) data=${formatHex(new Uint8Array([0x00, ...TASOLLER_OPTIONS_DBT_TRIGGER_PAYLOAD]))}`
    );
    setOptionsStatusKey("options.status.sentDbt");
  }

  async stopOptionsMonitor() {
    this.optionsMonitoring = false;

    if (this.optionsHidDevice) {
      this.optionsHidDevice.removeEventListener("inputreport", this.handleOptionsHidReport);
    }

    this.optionsTransport = null;
    this.optionsInterfaceNumber = null;
    this.optionsInEndpointNumber = null;
    this.optionsOutEndpointNumber = null;
    this.optionsInterfaceClass = null;
    this.optionsInterfaceSubclass = null;
    this.optionsInterfaceProtocol = null;
    setOptionsStatusKey("options.status.stopped");
    updateOptionsControls();
  }

  buildLightPacket(lighting) {
    const packet = new Uint8Array(114);
    packet[0] = 0x44;
    packet[1] = 0x4c;
    packet[2] = 0x02;

    for (let index = 0; index < 31; index++) {
      const base = 3 + index * 3;
      const color = lighting.slider[index];
      packet[base + 0] = color.r;
      packet[base + 1] = color.g;
      packet[base + 2] = color.b;
    }

    for (let index = 0; index < 3; index++) {
      const leftBase = 96 + index * 3;
      const rightBase = 105 + index * 3;
      packet[leftBase + 0] = lighting.leftAir.r;
      packet[leftBase + 1] = lighting.leftAir.g;
      packet[leftBase + 2] = lighting.leftAir.b;
      packet[rightBase + 0] = lighting.rightAir.r;
      packet[rightBase + 1] = lighting.rightAir.g;
      packet[rightBase + 2] = lighting.rightAir.b;
    }

    return packet;
  }
}

class Io4WebHidAdapter extends DeviceAdapter {
  constructor() {
    super("SEGA IO4");
    this.device = null;
    this.handleInputReport = (event) => {
      const bytes = new Uint8Array(event.data.buffer);
      const parsed = parseIo4Input(event.reportId, bytes);
      if (parsed) {
        applyControllerState(parsed);
      }
    };
  }

  getButtonLayout() {
    return ["SERVICE", "TEST"];
  }

  async connect() {
    if (!("hid" in navigator)) {
      throw new Error(t("error.webhidUnsupported"));
    }

    let device = this.device;
    if (!device) {
      const selected = await navigator.hid.requestDevice({
        filters: [{ vendorId: VENDOR_SEGA_IO4, productId: PRODUCT_SEGA_IO4 }],
      });
      [device] = selected;
    }

    if (!device) {
      throw new Error(t("error.noIo4"));
    }

    this.device = device;
    if (!this.device.opened) {
      await this.device.open();
    }
    this.device.removeEventListener("inputreport", this.handleInputReport);
    this.device.addEventListener("inputreport", this.handleInputReport);
    this.setConnected(true);
  }

  async disconnect() {
    if (this.device) {
      this.device.removeEventListener("inputreport", this.handleInputReport);
      if (this.device.opened) {
        await this.device.close();
      }
      this.device = null;
    }

    await super.disconnect();
  }

  async writeLights(lighting) {
    return;
  }
}

class AimeReaderSerialAdapter {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.readLoopPromise = null;
    this.seq = 0;
    this.waiters = [];
    this.decoded = [];
    this.escaped = false;
    this.inFrame = false;
    this.commandQueue = Promise.resolve();
    this.rawBytes = [];
    this.pn532Waiters = [];
    this.protocol = "sega";
  }

  async connect(baudRate = AIME_READER_DEFAULT_BAUD) {
    if (!("serial" in navigator)) {
      throw new Error(t("error.webserialUnsupported"));
    }

    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate });
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.connected = true;
    setAimeReaderStatusKey("aime.status.connected");
    appendAimeReaderLog(t("aime.log.connected", { baud: baudRate }));
    this.readLoopPromise = this.readLoop();
  }

  async disconnect() {
    this.connected = false;
    this.rejectWaiters(new Error(t("aime.error.disconnected")));

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (_error) {
      }
    }

    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise;
      } catch (_error) {
      }
      this.readLoopPromise = null;
    }

    if (this.reader) {
      try {
        this.reader.releaseLock();
      } catch (_error) {
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (_error) {
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (_error) {
      }
      this.port = null;
    }

    setAimeReaderStatusKey("aime.status.disconnected");
  }

  rejectWaiters(error) {
    const waiters = this.waiters.splice(0);
    waiters.forEach((waiter) => {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    });
    const pn532Waiters = this.pn532Waiters.splice(0);
    pn532Waiters.forEach((waiter) => {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    });
  }

  async readLoop() {
    while (this.connected && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        if (!value) {
          continue;
        }
        for (const byte of value) {
          this.consumeByte(byte);
        }
      } catch (error) {
        if (this.connected) {
          setAimeReaderStatus(t("aime.error.read", { message: error.message || String(error) }), true);
        }
        break;
      }
    }
    this.connected = false;
  }

  consumeByte(byte) {
    this.consumeRawByte(byte);

    if (byte === SG_SYNC) {
      this.inFrame = true;
      this.escaped = false;
      this.decoded = [];
      return;
    }

    if (!this.inFrame) {
      return;
    }

    if (byte === SG_ESCAPE) {
      this.escaped = true;
      return;
    }

    const decodedByte = this.escaped ? ((byte + 1) & 0xff) : byte;
    this.escaped = false;
    this.decoded.push(decodedByte);

    const frameLength = this.decoded[0];
    if (frameLength && this.decoded.length === frameLength + 1) {
      this.acceptFrame(this.decoded);
      this.inFrame = false;
      this.decoded = [];
    }
  }

  consumeRawByte(byte) {
    this.rawBytes.push(byte);
    if (this.rawBytes.length > 512) {
      this.rawBytes.splice(0, this.rawBytes.length - 512);
    }
    this.acceptPn532Packets();
  }

  acceptPn532Packets() {
    while (this.rawBytes.length >= 6) {
      const start = this.rawBytes.findIndex((value, index, bytes) =>
        value === 0x00 && bytes[index + 1] === 0x00 && bytes[index + 2] === 0xff
      );
      if (start < 0) {
        this.rawBytes.splice(0, Math.max(0, this.rawBytes.length - 2));
        return;
      }
      if (start > 0) {
        this.rawBytes.splice(0, start);
      }
      if (this.rawBytes.length < 6) {
        return;
      }
      const length = this.rawBytes[3];
      const lcs = this.rawBytes[4];
      if (((length + lcs) & 0xff) !== 0) {
        this.rawBytes.shift();
        continue;
      }
      if (length === 0 && lcs === 0xff) {
        if (AIME_READER_DEBUG_LOG) {
          appendAimeReaderLog("RX PN532 ACK");
        }
        this.rawBytes.splice(0, 6);
        continue;
      }
      const total = 5 + length + 2;
      if (this.rawBytes.length < total) {
        return;
      }
      const packet = this.rawBytes.slice(0, total);
      this.rawBytes.splice(0, total);
      const direction = packet[5];
      const responseCommand = ((packet[6] ?? 0) - 1) & 0xff;
      const payload = packet.slice(7, 5 + length);
      const dcs = packet[5 + length];
      const checksum = packet.slice(5, 5 + length).reduce((sum, value) => (sum + value) & 0xff, 0);
      if (direction !== PN532_DEVICE_TO_HOST || ((checksum + dcs) & 0xff) !== 0) {
        appendAimeReaderLog(t("aime.log.badFrame", { hex: formatHex(packet) }));
        continue;
      }
      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX PN532 cmd=${hexByte(responseCommand)} payload=${formatHex(payload) || "-"}`);
      }
      const waiterIndex = this.pn532Waiters.findIndex((waiter) => waiter.command === responseCommand);
      if (waiterIndex < 0) {
        continue;
      }
      const [waiter] = this.pn532Waiters.splice(waiterIndex, 1);
      clearTimeout(waiter.timer);
      waiter.resolve(payload);
    }
  }

  acceptFrame(bytes) {
    const frame = bytes.slice(0, -1);
    const expected = bytes[bytes.length - 1];
    const checksum = frame.reduce((sum, value) => (sum + value) & 0xff, 0);
    if (checksum !== expected) {
      appendAimeReaderLog(t("aime.log.badChecksum", {
        expected: hexByte(expected),
        actual: hexByte(checksum),
      }));
      return;
    }

    if (frame.length < 6 || frame[0] !== frame.length) {
      appendAimeReaderLog(t("aime.log.badFrame", { hex: formatHex(frame) }));
      return;
    }

    const response = {
      frameLength: frame[0],
      addr: frame[1],
      seq: frame[2],
      cmd: frame[3],
      status: frame[4],
      payloadLength: frame[5],
      payload: frame.slice(6),
      frame,
    };

    if (AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog(`RX ${describeSgResponse(response)}`);
    }
    const waiterIndex = this.waiters.findIndex((waiter) =>
      waiter.addr === response.addr &&
      waiter.seq === response.seq &&
      waiter.cmd === response.cmd
    );
    if (waiterIndex < 0) {
      return;
    }

    const [waiter] = this.waiters.splice(waiterIndex, 1);
    clearTimeout(waiter.timer);
    waiter.resolve(response);
  }

  async sendCommand(addr, cmd, payload = [], timeoutMs = 1200) {
    if (!this.connected || !this.writer) {
      throw new Error(t("aime.error.notConnected"));
    }

    this.commandQueue = this.commandQueue
      .catch(() => {})
      .then(() => this.sendCommandNow(addr, cmd, payload, timeoutMs));
    return this.commandQueue;
  }

  async sendCommandNoResponse(addr, cmd, payload = [], options = {}) {
    if (!this.connected || !this.writer) {
      throw new Error(t("aime.error.notConnected"));
    }

    this.commandQueue = this.commandQueue
      .catch(() => {})
      .then(() => this.sendCommandNoResponseNow(addr, cmd, payload, options));
    return this.commandQueue;
  }

  async sendCommandNow(addr, cmd, payload = [], timeoutMs = 1200) {
    const data = Array.from(payload);
    const seq = this.seq;
    this.seq = (this.seq + 1) & 0xff;
    const frame = [5 + data.length, addr, seq, cmd, data.length, ...data];
    const encoded = encodeSgFrame(frame);
    if (AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog(`TX ${describeSgRequest({ addr, seq, cmd, payload: data })}`);
    }

    const responsePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.waiters.findIndex((waiter) =>
          waiter.addr === addr && waiter.seq === seq && waiter.cmd === cmd
        );
        if (index >= 0) {
          this.waiters.splice(index, 1);
        }
        reject(new Error(t("aime.error.timeout", { cmd: hexByte(cmd) })));
      }, timeoutMs);
      this.waiters.push({ addr, seq, cmd, resolve, reject, timer });
    });

    try {
      await this.writeBytes(encoded);
    } catch (error) {
      const index = this.waiters.findIndex((waiter) =>
        waiter.addr === addr && waiter.seq === seq && waiter.cmd === cmd
      );
      if (index >= 0) {
        const [waiter] = this.waiters.splice(index, 1);
        clearTimeout(waiter.timer);
      }
      throw error;
    }
    return responsePromise;
  }

  async sendCommandNoResponseNow(addr, cmd, payload = [], options = {}) {
    const data = Array.from(payload);
    const seq = this.seq;
    this.seq = (this.seq + 1) & 0xff;
    const frame = [5 + data.length, addr, seq, cmd, data.length, ...data];
    const encoded = encodeSgFrame(frame);
    if (!options.silent && AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog(`TX ${describeSgRequest({ addr, seq, cmd, payload: data })}`);
    }
    await this.writeBytes(encoded);
  }

  async writeBytes(bytes) {
    await this.writer.write(bytes);
  }

  async sendPn532Command(command, payload = [], timeoutMs = 1200) {
    if (!this.connected || !this.writer) {
      throw new Error(t("aime.error.notConnected"));
    }

    const responsePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.pn532Waiters.findIndex((waiter) => waiter.command === command);
        if (index >= 0) {
          this.pn532Waiters.splice(index, 1);
        }
        reject(new Error(t("aime.error.timeout", { cmd: `PN532 ${hexByte(command)}` })));
      }, timeoutMs);
      this.pn532Waiters.push({ command, resolve, reject, timer });
    });

    const packet = buildPn532Packet(command, payload);
    if (AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog(`TX PN532 cmd=${hexByte(command)} data=${formatHex(packet)}`);
    }
    await this.writeBytes(packet);
    return responsePromise;
  }

  async runProbe() {
    setAimeReaderStatusKey("aime.status.probing");
    clearAimeCardDisplay();

    try {
      await this.runSegaReaderProbe();
      return;
    } catch (error) {
      appendAimeReaderLog(t("aime.log.segaProbeFallback", { message: error.message || String(error) }));
    }

    await this.runDirectPn532Probe();
  }

  async runSegaReaderProbe() {
    setAimeReaderStatusKey("aime.status.probing");

    await this.sendCommand(SG_NFC_ADDR, SG_CMD_RESET, [], 1500).catch((error) => {
      appendAimeReaderLog(t("aime.log.resetWarning", { message: error.message || String(error) }));
    });

    const fw = await this.sendCommand(SG_NFC_ADDR, SG_CMD_GET_FW_VERSION);
    this.protocol = "sega";
    ui.aimeReaderFw.textContent = decodeReaderVersion(fw.payload);

    const hw = await this.sendCommand(SG_NFC_ADDR, SG_CMD_GET_HW_VERSION);
    ui.aimeReaderHw.textContent = decodeReaderVersion(hw.payload);

    await this.sendCommand(SG_LED_ADDR, SG_LED_CMD_RESET, [], 1500).catch(() => {});
    await this.sendCommand(SG_LED_ADDR, SG_LED_CMD_GET_INFO, [], 1500).catch(() => {});
    await this.sendCommand(SG_NFC_ADDR, SG_CMD_RADIO_ON, [0x03], 1500).catch(() => {});
    await this.sendCommand(SG_NFC_ADDR, SG_CMD_MIFARE_SET_KEY_B, asciiBytes("WCCFv2"), 1500).catch(() => {});
    await this.sendCommand(SG_NFC_ADDR, SG_CMD_MIFARE_SET_KEY_A, [0x60, 0x90, 0xd0, 0x06, 0x32, 0xf5], 1500).catch(() => {});

    await this.setReaderLed([0x00, 0x00, 0x00], "off", { silent: true });
    setAimeReaderStatusKey("aime.status.probeOk");
  }

  async runDirectPn532Probe() {
    const payload = await this.sendPn532Command(PN532_CMD_GET_FIRMWARE_VERSION, [], 1800);
    if (payload.length < 4) {
      throw new Error(t("aime.error.pn532ShortFirmware"));
    }
    ui.aimeReaderFw.textContent = t("aime.pn532Firmware", {
      ic: hexByte(payload[0]),
      major: payload[1],
      minor: payload[2],
      support: hexByte(payload[3]),
    });
    ui.aimeReaderHw.textContent = t("aime.reader.directPn532");
    this.protocol = "pn532";
    setAimeReaderStatusKey("aime.status.probeOk");
  }

  async pollCardOnce(options = {}) {
    const { manageLed = true, throwOnNoCard = false, throwOnReadError = false } = options;
    if (this.protocol === "pn532") {
      return this.pollDirectPn532CardOnce();
    }

    setAimeReaderStatusKey("aime.status.polling");
    if (manageLed) {
      await this.setReaderLed([0x40, 0x20, 0x00], "polling");
    }
    const response = await this.sendCommand(SG_NFC_ADDR, SG_CMD_POLL, [], 1800);
    const parsed = parseSgPollPayload(response.payload);
    if (!parsed) {
      ui.aimeCardType.textContent = "-";
      ui.aimeCardValue.textContent = "-";
      if (manageLed) {
        await this.setReaderLed([0x20, 0x10, 0x00], "no-card");
      }
      setAimeReaderStatusKey("aime.status.noCard");
      if (throwOnNoCard) {
        throw new Error(t("aime.error.noCardDuringScan"));
      }
      return false;
    }

    if (parsed.type === "mifare") {
      ui.aimeCardType.textContent = t("aime.card.mifare");
      ui.aimeCardValue.textContent = formatHex(parsed.uid);
      await this.readMifareDetails(parsed.uid);
      if (manageLed) {
        await this.setReaderLed([0x00, 0x40, 0x00], "card");
      }
      setAimeReaderStatusKey("aime.status.cardFound");
      return true;
    }

    const cardInfo = describeFelicaCard(parsed.idm, parsed.pmm);
    showFelicaCardNumbers(parsed.idm, cardInfo);
    await this.readFelicaSpad0(parsed.idm, parsed.pmm, cardInfo, { throwOnError: throwOnReadError });
    if (manageLed) {
      await this.setReaderLed([0x00, 0x40, 0x00], "card");
    }
    setAimeReaderStatusKey("aime.status.cardFound");
    return true;
  }

  async runTimedReaderScan() {
    if (this.protocol !== "sega") {
      throw new Error(t("aime.error.readerLedRequiresSega"));
    }

    setAimeReaderStatusKey("aime.status.scanning");
    clearAimeCardDisplay();
    appendAimeReaderLog(t("aime.log.scanStarted", { seconds: AIME_READER_SCAN_DURATION_MS / 1000 }));

    const scanRgb = selectedReaderLedRgb();
    const deadline = Date.now() + AIME_READER_SCAN_DURATION_MS;
    let nextBlinkAt = 0;
    let blinkOn = false;
    while (Date.now() < deadline) {
      try {
        const now = Date.now();
        if (now >= nextBlinkAt) {
          blinkOn = !blinkOn;
          nextBlinkAt = now + AIME_READER_LED_BLINK_MS;
          await this.setReaderLed(blinkOn ? scanRgb : [0x00, 0x00, 0x00], "scan", { silent: true });
        }
        if (await this.pollCardOnce({ manageLed: false, throwOnReadError: true })) {
          await this.setReaderLed([0x00, 0x00, 0xff], "scan-ok", { silent: true });
          appendAimeReaderLog(t("aime.log.scanCardFound"));
          setAimeReaderStatusKey("aime.status.cardFound");
          return true;
        }
      } catch (error) {
        await this.setReaderLed([0xff, 0x00, 0x00], "scan-error", { silent: true });
        throw error;
      }
      await sleep(AIME_READER_SCAN_POLL_INTERVAL_MS);
    }

    await this.setReaderLed([0xff, 0x00, 0x00], "scan-timeout", { silent: true });
    setAimeReaderStatusKey("aime.status.noCard");
    appendAimeReaderLog(t("aime.log.scanTimedOut"));
    return false;
  }

  async flashReaderLedWhite(durationMs = AIME_READER_SCAN_DURATION_MS) {
    if (this.protocol !== "sega") {
      throw new Error(t("aime.error.readerLedRequiresSega"));
    }

    appendAimeReaderLog(t("aime.log.readerLedFlashStarted", { seconds: durationMs / 1000 }));
    const deadline = Date.now() + durationMs;
    let blinkOn = false;
    while (Date.now() < deadline) {
      blinkOn = !blinkOn;
      await this.setReaderLed(blinkOn ? [0xff, 0xff, 0xff] : [0x00, 0x00, 0x00], "flash", { silent: true });
      await sleep(AIME_READER_LED_BLINK_MS);
    }
    await this.setReaderLed([0x00, 0x00, 0x00], "off", { silent: true });
  }

  async setReaderLed(rgb, reason, options = {}) {
    if (this.protocol !== "sega") {
      return;
    }

    try {
      await this.sendCommandNoResponse(SG_LED_ADDR, SG_LED_CMD_SET_COLOR, rgb, { silent: options.silent });
      if (!options.silent) {
        appendAimeReaderLog(t("aime.log.readerLed", { reason: t(`aime.readerLed.${reason}`), rgb: formatHex(rgb) }));
      }
    } catch (error) {
      appendAimeReaderLog(t("aime.log.readerLedFailed", { message: error.message || String(error) }));
    }
  }

  async readFelicaSpad0(idm, pmm, cardInfo = describeFelicaCard(idm, pmm), options = {}) {
    try {
      const response = await this.sendFelicaEncapWithRetry(
        idm,
        buildFelicaReadWithoutEncryption(idm, FELICA_LITES_READ_ONLY_SERVICE, 0),
      );
      const spad0 = parseFelicaReadWithoutEncryptionResponse(response.payload, idm);
      const accessCode = decodeSpad0AccessCode(spad0);
      if (accessCode) {
        showFelicaCardNumbers(idm, cardInfo, accessCode);
        appendAimeReaderLog(t("aime.log.felicaAccessCodeRead"));
      } else {
        showFelicaCardNumbers(idm, cardInfo);
        const lookupCode = await lookupFelicaAccessCode(idm, pmm, spad0, cardInfo);
        if (lookupCode) {
          appendAimeReaderLog(t("aime.log.felicaAccessCodeRead"));
        }
        return;
      }
    } catch (error) {
      const lookupCode = await lookupFelicaAccessCode(idm, pmm, [], cardInfo);
      if (lookupCode) {
        appendAimeReaderLog(t("aime.log.felicaAccessCodeRead"));
      }
      return;
    }
  }

  async sendFelicaEncapWithRetry(idm, felicaFrame) {
    const payload = buildFelicaEncapPayload(idm, felicaFrame);
    try {
      return await this.sendCommand(SG_NFC_ADDR, SG_CMD_FELICA_ENCAP, payload, 2200);
    } catch (firstError) {
      appendAimeReaderLog(t("aime.log.felicaEncapRetry", { message: firstError.message || String(firstError) }));
      await this.sendCommand(SG_NFC_ADDR, SG_CMD_RADIO_ON, [0x03], 1500).catch(() => {});
      try {
        return await this.sendCommand(SG_NFC_ADDR, SG_CMD_FELICA_ENCAP, payload, 4500);
      } catch (secondError) {
        throw new Error(t("aime.error.felicaEncapTimeout", { message: secondError.message || String(secondError) }));
      }
    }
  }

  async pollDirectPn532CardOnce() {
    setAimeReaderStatusKey("aime.status.polling");
    await this.sendPn532Command(PN532_CMD_SAM_CONFIGURATION, [0x01, 0x14, 0x01], 1800).catch(() => {});
    const poll = await this.sendPn532Command(
      PN532_CMD_IN_LIST_PASSIVE_TARGET,
      [0x01, 0x01, 0xff, 0xff, 0x01, 0x00],
      2200,
    );
    const parsed = parsePn532FelicaTarget(poll);
    if (!parsed) {
      throw new Error(t("aime.error.pn532FelicaTargetNotFound", { hex: formatHex(poll) || "-" }));
    }

    const cardInfo = describeFelicaCard(parsed.idm, parsed.pmm);
    showFelicaCardNumbers(parsed.idm, cardInfo);

    const inner = buildFelicaReadWithoutEncryption(parsed.idm, FELICA_LITES_READ_ONLY_SERVICE, 0);
    const dataExchange = await this.sendPn532Command(PN532_CMD_IN_DATA_EXCHANGE, [parsed.target, ...inner], 2200);
    if (dataExchange[0] !== 0) {
      throw new Error(t("aime.error.pn532DataExchangeStatus", { status: hexByte(dataExchange[0] ?? 0) }));
    }
    const spad0 = parseFelicaReadWithoutEncryptionResponse(dataExchange.slice(1), parsed.idm);
    const accessCode = decodeSpad0AccessCode(spad0);
    if (accessCode) {
      showFelicaCardNumbers(parsed.idm, cardInfo, accessCode);
      appendAimeReaderLog(t("aime.log.felicaAccessCodeRead"));
    } else {
      showFelicaCardNumbers(parsed.idm, cardInfo);
      const lookupCode = await lookupFelicaAccessCode(parsed.idm, parsed.pmm, spad0, cardInfo);
      if (lookupCode) {
        appendAimeReaderLog(t("aime.log.felicaAccessCodeRead"));
      }
    }
    setAimeReaderStatusKey("aime.status.cardFound");
  }

  async readMifareDetails(uid) {
    const authenticated = await this.authenticateMifareSector(uid, 0);
    if (!authenticated) {
      appendAimeReaderLog(t("aime.log.mifareSectorAuthFailed", { sector: 0 }));
      return;
    }

    const blocks = [];
    for (const blockNo of [1, 2]) {
      try {
        const block = await this.sendCommand(SG_NFC_ADDR, SG_CMD_MIFARE_READ_BLOCK, [...uid, blockNo], 1800);
        blocks[blockNo] = block.payload.slice(0, 16);
      } catch (error) {
      }
    }

    const accessBytes = blocks[2]?.slice(6, 16);
    if (accessBytes?.length === 10) {
      const accessCode = bcdBytesToText(accessBytes);
      ui.aimeCardType.textContent = t("aime.card.mifareAime");
      ui.aimeCardValue.textContent = accessCode || formatHex(accessBytes);
    }
  }

  async authenticateMifareSector(uid, blockNo) {
    const attempts = [
      {
        setKeyCommand: SG_CMD_MIFARE_SET_KEY_B,
        authCommand: SG_CMD_MIFARE_AUTHENTICATE_B,
        key: asciiBytes("WCCFv2"),
        labelKey: "aime.mifareKey.wccfv2B",
      },
      {
        setKeyCommand: SG_CMD_MIFARE_SET_KEY_A,
        authCommand: SG_CMD_MIFARE_AUTHENTICATE_A,
        key: [0x60, 0x90, 0xd0, 0x06, 0x32, 0xf5],
        labelKey: "aime.mifareKey.banapassA",
      },
      {
        setKeyCommand: SG_CMD_MIFARE_SET_KEY_A,
        authCommand: SG_CMD_MIFARE_AUTHENTICATE_A,
        key: [0xff, 0xff, 0xff, 0xff, 0xff, 0xff],
        labelKey: "aime.mifareKey.defaultA",
      },
    ];

    for (const attempt of attempts) {
      try {
        await this.sendCommand(SG_NFC_ADDR, attempt.setKeyCommand, attempt.key, 1500);
        await this.sendCommand(SG_NFC_ADDR, SG_CMD_MIFARE_SELECT_TAG, uid, 1500);
        await this.sendCommand(SG_NFC_ADDR, attempt.authCommand, [...uid, blockNo], 1500);
        return true;
      } catch (error) {
      }
    }

    return false;
  }
}

class HinataHidReaderAdapter extends AimeReaderSerialAdapter {
  constructor() {
    super();
    this.device = null;
    this.hidReportId = 0;
    this.firmwareWaiters = [];
    this.handleInputReport = (event) => {
      const bytes = new Uint8Array(event.data.buffer.slice(0, event.data.byteLength));

      if (event.reportId === 0x03) {
        const firmware = extractHinataFirmware(bytes);
        if (firmware) {
          appendAimeReaderLog(t("aime.log.hinataFirmware", { firmware }));
          const waiters = this.firmwareWaiters.splice(0);
          waiters.forEach((waiter) => {
            clearTimeout(waiter.timer);
            waiter.resolve(firmware);
          });
        }
        return;
      }

      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX HID report=${hexByte(event.reportId)} data=${formatHex(bytes) || "-"}`);
      }
      for (const byte of bytes) {
        this.consumeByte(byte);
      }
    };
  }

  async connect() {
    if (!("hid" in navigator)) {
      throw new Error(t("error.webhidUnsupported"));
    }

    const selected = await navigator.hid.requestDevice({
      filters: [{ vendorId: HINATA_VENDOR_ID }],
    });
    [this.device] = selected;
    if (!this.device) {
      throw new Error(t("aime.error.noHinata"));
    }

    await this.device.open();
    this.device.addEventListener("inputreport", this.handleInputReport);
    this.connected = true;
    setAimeReaderStatusKey("aime.status.connected");
    appendAimeReaderLog(t("aime.log.hinataHidConnected", {
      name: this.device.productName || "Hinata",
    }));

    await this.probeHinataFirmware().catch((error) => {
      appendAimeReaderLog(t("aime.log.hinataFirmwareFailed", {
        message: error.message || String(error),
      }));
    });
  }

  async disconnect() {
    this.connected = false;
    this.rejectWaiters(new Error(t("aime.error.disconnected")));
    const waiters = this.firmwareWaiters.splice(0);
    waiters.forEach((waiter) => {
      clearTimeout(waiter.timer);
      waiter.reject(new Error(t("aime.error.disconnected")));
    });

    if (this.device) {
      this.device.removeEventListener("inputreport", this.handleInputReport);
      if (this.device.opened) {
        await this.device.close();
      }
      this.device = null;
    }

    setAimeReaderStatusKey("aime.status.disconnected");
  }

  async probeHinataFirmware() {
    const firmwarePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.firmwareWaiters.findIndex((waiter) => waiter.resolve === resolve);
        if (index >= 0) {
          this.firmwareWaiters.splice(index, 1);
        }
        reject(new Error(t("aime.error.timeout", { cmd: "Hinata FW" })));
      }, 1200);
      this.firmwareWaiters.push({ resolve, reject, timer });
    });

    if (AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog("TX HID report=0x01 data=01");
    }
    await this.device.sendReport(0x01, Uint8Array.from([0x01]));
    const firmware = await firmwarePromise;
    ui.aimeReaderFw.textContent = `Hinata ${firmware}`;
    return firmware;
  }

  async writeBytes(bytes) {
    if (!this.device?.opened) {
      throw new Error(t("aime.error.notConnected"));
    }

    const attempts = this.hidReportId === 0 ? [0, 1] : [this.hidReportId, 0, 1];
    let lastError = null;
    for (const reportId of [...new Set(attempts)]) {
      try {
        if (AIME_READER_DEBUG_LOG) {
          appendAimeReaderLog(`TX HID report=${hexByte(reportId)} data=${formatHex(bytes)}`);
        }
        await this.device.sendReport(reportId, bytes);
        this.hidReportId = reportId;
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error(t("aime.error.hidWriteFailed"));
  }
}

class HinataUsbReaderAdapter extends AimeReaderSerialAdapter {
  constructor() {
    super();
    this.device = null;
    this.inputEndpoint = null;
    this.outputEndpoint = null;
    this.outputPacketSize = 64;
    this.claimedInterfaceNumbers = [];
    this.protocol = "unknown";
  }

  async connect() {
    if (!("usb" in navigator)) {
      throw new Error(t("error.webusbUnsupported"));
    }

    this.device = await navigator.usb.requestDevice({
      filters: [{ vendorId: HINATA_VENDOR_ID }],
    });
    if (!this.device) {
      throw new Error(t("aime.error.noHinata"));
    }

    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }

    const candidates = await this.claimCandidateEndpoints();
    if (!candidates.read.length || !candidates.write.length) {
      throw new Error(t("aime.error.noHinataEndpoints"));
    }

    await this.probeEndpointPairs(candidates);
    this.connected = true;
    setAimeReaderStatusKey("aime.status.connected");
    appendAimeReaderLog(t("aime.log.hinataUsbConnected", {
      name: this.device.productName || "Hinata",
      mode: this.protocol,
    }));
    this.readLoopPromise = this.readLoop();
  }

  async claimCandidateEndpoints() {
    const read = [];
    const write = [];
    const claimed = new Set();
    const interfaces = this.device.configuration?.interfaces ?? [];

    for (const usbInterface of interfaces) {
      for (const alternate of usbInterface.alternates ?? []) {
        const ifaceClass = alternate.interfaceClass;
        const preferred = ifaceClass === 0x03 ||
          ifaceClass === 0xff ||
          ifaceClass === 0x02 ||
          ifaceClass === 0x0a;
        if (!preferred) {
          continue;
        }

        if (!claimed.has(usbInterface.interfaceNumber)) {
          try {
            await this.device.claimInterface(usbInterface.interfaceNumber);
            claimed.add(usbInterface.interfaceNumber);
            this.claimedInterfaceNumbers.push(usbInterface.interfaceNumber);
          } catch (error) {
            appendAimeReaderLog(t("aime.log.usbClaimFailed", {
              iface: usbInterface.interfaceNumber,
              message: error.message || String(error),
            }));
            continue;
          }
        }

        for (const endpoint of alternate.endpoints ?? []) {
          if (endpoint.type !== "bulk" && endpoint.type !== "interrupt") {
            continue;
          }
          const candidate = {
            interfaceNumber: usbInterface.interfaceNumber,
            endpointNumber: endpoint.endpointNumber,
            direction: endpoint.direction,
            type: endpoint.type,
            packetSize: endpoint.packetSize || 64,
          };
          if (endpoint.direction === "in") {
            read.push(candidate);
          } else if (endpoint.direction === "out") {
            write.push(candidate);
          }
        }
      }
    }

    return { read, write };
  }

  async probeEndpointPairs(candidates) {
    for (const outEndpoint of candidates.write) {
      for (const inEndpoint of candidates.read) {
        if (AIME_READER_DEBUG_LOG) {
          appendAimeReaderLog(t("aime.log.usbProbePair", {
            out: outEndpoint.endpointNumber,
            in: inEndpoint.endpointNumber,
          }));
        }

        const sega = await this.trySegaEndpoint(outEndpoint, inEndpoint);
        if (sega) {
          this.selectEndpoints(outEndpoint, inEndpoint, "sega-reader");
          ui.aimeReaderFw.textContent = sega;
          return;
        }

        const hinataFw = await this.tryHinataFirmwareEndpoint(outEndpoint, inEndpoint);
        if (hinataFw) {
          this.selectEndpoints(outEndpoint, inEndpoint, "hinata-pn532");
          ui.aimeReaderFw.textContent = `Hinata ${hinataFw}`;
          ui.aimeReaderHw.textContent = "Hinata USB";
          return;
        }

        const directPn532 = await this.tryDirectPn532Endpoint(outEndpoint, inEndpoint);
        if (directPn532) {
          this.selectEndpoints(outEndpoint, inEndpoint, "direct-pn532");
          ui.aimeReaderFw.textContent = directPn532;
          ui.aimeReaderHw.textContent = "Direct PN532 USB";
          return;
        }
      }
    }

    throw new Error(t("aime.error.noHinataEndpoints"));
  }

  selectEndpoints(outEndpoint, inEndpoint, protocol) {
    this.outputEndpoint = outEndpoint;
    this.inputEndpoint = inEndpoint;
    this.outputPacketSize = outEndpoint.packetSize || 64;
    this.protocol = protocol;
  }

  async tryHinataFirmwareEndpoint(outEndpoint, inEndpoint) {
    try {
      const probe = this.padUsbPacket(Uint8Array.from([HINATA_REPORT_ID, HINATA_CMD_FW]), outEndpoint.packetSize);
      await this.transferOut(outEndpoint, probe);
      const bytes = await this.transferIn(inEndpoint, 1200);
      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX USB data=${formatHex(bytes)}`);
      }
      if (bytes[0] === 0x03) {
        const firmware = extractHinataFirmware(bytes.slice(1));
        if (firmware) {
          return firmware;
        }
      }
    } catch (error) {
      appendAimeReaderLog(t("aime.log.usbProbeFailed", {
        mode: "Hinata FW",
        message: error.message || String(error),
      }));
    }
    return "";
  }

  async tryDirectPn532Endpoint(outEndpoint, inEndpoint) {
    try {
      const packet = buildPn532Packet(PN532_CMD_GET_FIRMWARE_VERSION, []);
      await this.transferOut(outEndpoint, packet);
      const bytes = await this.transferIn(inEndpoint, 1200);
      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX USB PN532 data=${formatHex(bytes)}`);
      }
      const payload = extractPn532ResponsePayload(bytes, PN532_CMD_GET_FIRMWARE_VERSION);
      if (payload.length >= 4) {
        return `PN532 IC=${hexByte(payload[0])} FW=${payload[1]}.${payload[2]} support=${hexByte(payload[3])}`;
      }
    } catch (error) {
      appendAimeReaderLog(t("aime.log.usbProbeFailed", {
        mode: "Direct PN532",
        message: error.message || String(error),
      }));
    }
    return "";
  }

  async trySegaEndpoint(outEndpoint, inEndpoint) {
    try {
      const frame = encodeSgFrame([5, SG_NFC_ADDR, 0, SG_CMD_GET_FW_VERSION, 0]);
      await this.transferOut(outEndpoint, frame);
      const bytes = await this.transferIn(inEndpoint, 1200);
      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX USB SEGA data=${formatHex(bytes)}`);
      }
      const decoded = decodeSgResponseBytes(bytes);
      if (decoded.cmd === SG_CMD_GET_FW_VERSION && decoded.status === 0) {
        return decodeReaderVersion(decoded.payload) || "SEGA Reader";
      }
    } catch (error) {
      appendAimeReaderLog(t("aime.log.usbProbeFailed", {
        mode: "SEGA reader",
        message: error.message || String(error),
      }));
    }
    return "";
  }

  padUsbPacket(bytes, packetSize = 64) {
    const size = Math.max(packetSize || 64, bytes.length);
    const padded = new Uint8Array(size);
    padded.set(bytes);
    return padded;
  }

  async transferOut(endpoint, bytes) {
    const result = await this.device.transferOut(endpoint.endpointNumber, bytes);
    if (result.status !== "ok") {
      throw new Error(`transferOut ${result.status}`);
    }
  }

  async transferIn(endpoint, timeoutMs = 1000) {
    const transfer = this.device.transferIn(endpoint.endpointNumber, endpoint.packetSize || 64);
    const timeout = new Promise((_resolve, reject) => {
      setTimeout(() => reject(new Error("USB read timeout")), timeoutMs);
    });
    const result = await Promise.race([transfer, timeout]);
    if (result.status !== "ok" || !result.data) {
      throw new Error(`transferIn ${result.status}`);
    }
    return Array.from(new Uint8Array(result.data.buffer.slice(0, result.data.byteLength)));
  }

  async readLoop() {
    while (this.connected && this.device && this.inputEndpoint) {
      try {
        const bytes = await this.transferIn(this.inputEndpoint, 5000);
        this.consumeUsbBytes(bytes);
      } catch (error) {
        if (this.connected && !String(error.message || error).includes("timeout")) {
          setAimeReaderStatus(t("aime.error.read", { message: error.message || String(error) }), true);
        }
      }
    }
    this.connected = false;
  }

  consumeUsbBytes(bytes) {
    if (bytes[0] === 0x03) {
      const firmware = extractHinataFirmware(bytes.slice(1));
      if (firmware) {
        appendAimeReaderLog(t("aime.log.hinataFirmware", { firmware }));
        return;
      }
    }

    if (this.protocol === "hinata-pn532" && bytes[1] === HINATA_CMD_PN532) {
      if (AIME_READER_DEBUG_LOG) {
        appendAimeReaderLog(`RX USB Hinata PN532 data=${formatHex(bytes)}`);
      }
      bytes.slice(2).forEach((byte) => this.consumeRawByte(byte));
      return;
    }

    if (AIME_READER_DEBUG_LOG) {
      appendAimeReaderLog(`RX USB data=${formatHex(bytes)}`);
    }
    bytes.forEach((byte) => this.consumeByte(byte));
  }

  async writeBytes(bytes) {
    if (!this.connected || !this.outputEndpoint) {
      throw new Error(t("aime.error.notConnected"));
    }
    await this.transferOut(this.outputEndpoint, bytes);
  }

  async sendPn532Command(command, payload = [], timeoutMs = 1200) {
    const responsePromise = new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const index = this.pn532Waiters.findIndex((waiter) => waiter.command === command);
        if (index >= 0) {
          this.pn532Waiters.splice(index, 1);
        }
        reject(new Error(t("aime.error.timeout", {
          cmd: `${this.protocol === "hinata-pn532" ? "Hinata " : ""}PN532 ${hexByte(command)}`,
        })));
      }, timeoutMs);
      this.pn532Waiters.push({ command, resolve, reject, timer });
    });

    const pn532Packet = buildPn532Packet(command, payload);
    const packet = this.protocol === "hinata-pn532"
      ? Uint8Array.from([HINATA_REPORT_ID, HINATA_CMD_PN532, ...pn532Packet])
      : pn532Packet;
    appendAimeReaderLog(`TX USB PN532 cmd=${hexByte(command)} data=${formatHex(packet)}`);
    await this.writeBytes(packet);
    return responsePromise;
  }

  async disconnect() {
    this.connected = false;
    this.rejectWaiters(new Error(t("aime.error.disconnected")));

    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise;
      } catch (_error) {
      }
      this.readLoopPromise = null;
    }

    if (this.device) {
      for (const interfaceNumber of this.claimedInterfaceNumbers) {
        try {
          await this.device.releaseInterface(interfaceNumber);
        } catch (_error) {
        }
      }
      if (this.device.opened) {
        await this.device.close();
      }
      this.device = null;
    }

    this.claimedInterfaceNumbers = [];
    this.inputEndpoint = null;
    this.outputEndpoint = null;
    setAimeReaderStatusKey("aime.status.disconnected");
  }
}

class TouchSerialAdapter {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.connected = false;
    this.readLoopPromise = null;
    this.ledWriteCount = 0;
    this.writeQueue = Promise.resolve();
    this.lastStatusText = "";
    this.lastLedError = "";
    this.parseState = "sync";
    this.marked = false;
    this.command = 0;
    this.length = 0;
    this.data = [];
    this.sum = 0;
  }

  async connect() {
    if (!("serial" in navigator)) {
      throw new Error(t("error.webserialUnsupported"));
    }

    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate: 115200 });
    this.reader = this.port.readable.getReader();
    this.writer = this.port.writable.getWriter();
    this.connected = true;
    this.setStatusKey("touch.status.connected");
    await this.sendCommand(SLIDER_CMD_REPORT_ENABLE);
    this.readLoopPromise = this.readLoop();
  }

  async disconnect() {
    this.connected = false;

    try {
      await this.sendCommand(SLIDER_CMD_REPORT_DISABLE);
    } catch (_error) {
    }

    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (_error) {
      }
    }

    if (this.readLoopPromise) {
      try {
        await this.readLoopPromise;
      } catch (_error) {
      }
      this.readLoopPromise = null;
    }

    if (this.reader) {
      try {
        this.reader.releaseLock();
      } catch (_error) {
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        this.writer.releaseLock();
      } catch (_error) {
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        await this.port.close();
      } catch (_error) {
      }
      this.port = null;
    }

    this.setStatusKey("touch.status.disconnected");
  }

  setStatus(text, isError = false) {
    state.touchComStatusKey = "";
    state.touchComStatusText = text;
    if (text === this.lastStatusText) {
      return;
    }
    this.lastStatusText = text;
    ui.touchComStatus.textContent = text;
    ui.touchComStatus.style.color = isError ? "var(--warn)" : "";
  }

  setStatusKey(key, isError = false) {
    state.touchComStatusKey = key;
    state.touchComStatusText = "";
    this.setStatus(t(key), isError);
    state.touchComStatusKey = key;
    state.touchComStatusText = "";
  }

  async readLoop() {
    while (this.connected && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          break;
        }
        if (!value) {
          continue;
        }

        for (const byte of value) {
          this.consumeByte(byte);
        }
      } catch (error) {
        if (this.connected) {
          this.setStatus(`Touch COM read error: ${error.message}`, true);
        }
        break;
      }
    }

    this.connected = false;
  }

  consumeByte(rawByte) {
    let byte = rawByte;
    if (byte === SLIDER_MARK) {
      this.marked = true;
      return;
    }
    if (this.marked) {
      this.marked = false;
      if (byte === SLIDER_MARKED_SYNC || byte === SLIDER_MARKED_MARK) {
        byte += 1;
      }
    }

    switch (this.parseState) {
      case "sync":
        if (byte === SLIDER_SYNC) {
          this.sum = SLIDER_SYNC;
          this.data = [];
          this.parseState = "cmd";
        }
        break;
      case "cmd":
        this.command = byte;
        this.sum = (this.sum + byte) & 0xff;
        this.parseState = "len";
        break;
      case "len":
        this.length = byte;
        this.sum = (this.sum + byte) & 0xff;
        this.data = [];
        this.parseState = this.length === 0 ? "checksum" : "data";
        break;
      case "data":
        this.data.push(byte);
        this.sum = (this.sum + byte) & 0xff;
        if (this.data.length >= this.length) {
          this.parseState = "checksum";
        }
        break;
      case "checksum":
        this.sum = (this.sum + byte) & 0xff;
        if (this.sum === 0) {
          this.handlePacket(this.command, this.data);
        }
        this.parseState = "sync";
        break;
      default:
        this.parseState = "sync";
        break;
    }
  }

  processSliderReport(command, rawValues, remapped) {
    const now = performance.now();
    const threshold = getTouchThreshold();
    const packetHasTouch = remapped.some((value) => value >= threshold);
    const heldHasTouch = state.touchComHeldSlider.some((value) => value >= threshold);
    let slider;

    if (packetHasTouch) {
      state.lastTouchComNonEmptyAt = now;
    }

    if (
      !packetHasTouch &&
      heldHasTouch &&
      now - state.lastTouchComNonEmptyAt < TOUCH_COM_EMPTY_PACKET_HOLD_MS
    ) {
      state.touchComZeroFrames = state.touchComZeroFrames.map((value) => value + 1);
      slider = state.touchComHeldSlider.slice();
    } else {
      slider = remapped.map((value, index) => {
        if (value >= threshold) {
          state.touchComHeldSlider[index] = value;
          state.touchComZeroFrames[index] = 0;
          state.touchComLastActiveAt[index] = now;
          return value;
        }
        if (value > 0) {
          state.touchComHeldSlider[index] = 0;
          return value;
        }
        state.touchComZeroFrames[index] += 1;
        if (
          state.touchComHeldSlider[index] >= threshold &&
          now - state.touchComLastActiveAt[index] < TOUCH_COM_RELEASE_HOLD_MS
        ) {
          return state.touchComHeldSlider[index];
        }
        state.touchComHeldSlider[index] = 0;
        return 0;
      });
    }
    state.slider = slider;
    state.raw = {
      ...state.raw,
      touchCom: {
        command,
        slider,
        rawSlider: rawValues.slice(0, 32),
        remappedSlider: remapped,
      },
    };
    render();
    this.setStatusKey("touch.status.receiving");
  }

  handlePacket(command, data) {
    if (command === SLIDER_TX_REPORT && data.length >= 32) {
      const rawValues = data.slice(0, 32);
      const remapped = Array.from({ length: 32 }, (_unused, index) =>
        rawValues[31 - index] ?? 0
      );
      this.processSliderReport(command, rawValues, remapped);
    } else if (command === SLIDER_TX_REPORT_DISABLE) {
      this.setStatusKey("touch.status.reportsDisabled");
    }
  }

  async writeLights(lighting) {
    if (!this.connected || !this.writer) {
      return;
    }

    const data = new Uint8Array(97);
    data[0] = 40;
    const off = { r: 0, g: 0, b: 0 };
    for (let index = 0; index < 32; index++) {
      const color = index < 31 ? (lighting.slider[index] ?? off) : off;
      const base = 1 + index * 3;
      data[base + 0] = color.b;
      data[base + 1] = color.r;
      data[base + 2] = color.g;
    }

    try {
      await this.sendCommand(SLIDER_CMD_LED, data);
      this.ledWriteCount += 1;
      this.lastLedError = "";
    } catch (error) {
      const message = error?.message || String(error);
      if (message !== this.lastLedError) {
        this.lastLedError = message;
        this.setStatus(`Touch COM LED write failed: ${message}`, true);
      }
    }
  }

  async sendCommand(command, data = new Uint8Array()) {
    if (!this.writer) {
      return;
    }

    const payload = Array.from(data);
    const packet = [SLIDER_SYNC, command, payload.length, ...payload];
    const checksum = (-(packet.reduce((sum, value) => (sum + value) & 0xff, 0)) & 0xff);
    packet.push(checksum);
    const encoded = [];
    packet.forEach((value, index) => {
      if (index > 0 && value === SLIDER_SYNC) {
        encoded.push(SLIDER_MARK, SLIDER_MARKED_SYNC);
      } else if (index > 0 && value === SLIDER_MARK) {
        encoded.push(SLIDER_MARK, SLIDER_MARKED_MARK);
      } else {
        encoded.push(value);
      }
    });
    const bytes = Uint8Array.from(encoded);
    this.writeQueue = this.writeQueue
      .catch(() => {})
      .then(() => this.writer.write(bytes));
    await this.writeQueue;
  }
}

function decodeAirBits(value) {
  return Array.from(
    { length: 6 },
    (_, index) => (((value >> index) & 0x01) !== 0 ? 255 : 0)
  );
}

function normalizeAirPairs(values) {
  return [
    values[1] ?? 0,
    values[0] ?? 0,
    values[3] ?? 0,
    values[2] ?? 0,
    values[5] ?? 0,
    values[4] ?? 0,
  ];
}

function parseTasollerInput(bytes) {
  if (bytes.length < 36) {
    return null;
  }

  const jvs = bytes[3];
  const rawSlider = Array.from(bytes.slice(4, 36));
  const mergedSlider = Array(32).fill(0);

  for (let index = 0; index < 32; index++) {
    const sourceIndex = (index & 1) !== 0 ? 32 - index : 30 - index;
    mergedSlider[index] = rawSlider[sourceIndex] ?? 0;
  }

  return {
    buttons: [((jvs >> 7) & 0x01) !== 0, ((jvs >> 6) & 0x01) !== 0],
    air: normalizeAirPairs(decodeAirBits(
      (((jvs >> 1) & 0x01) << 0) |
      (((jvs >> 0) & 0x01) << 1) |
      (((jvs >> 3) & 0x01) << 2) |
      (((jvs >> 2) & 0x01) << 3) |
      (((jvs >> 5) & 0x01) << 4) |
      (((jvs >> 4) & 0x01) << 5)
    )),
    slider: mergedSlider.slice().reverse(),
    raw: {
      header: Array.from(bytes.slice(0, 3)),
      jvs,
      sliderPacket: rawSlider,
    },
  };
}

function parseTasollerPlusInput(bytes) {
  if (bytes.length < 36) {
    return null;
  }

  const irButtons = bytes[3];
  const rawSlider = Array.from(bytes.slice(4, 36));
  let reversed = 0;
  let workingBits = irButtons;

  for (let bit = 0; bit < 8; bit++) {
    reversed = (reversed << 1) | (workingBits & 0x01);
    workingBits >>= 1;
  }

  const ir = (reversed >> 2) & 0x3f;
  const swappedIr = ((ir & 0x15) << 1) | ((ir & 0x2a) >> 1);

  return {
    buttons: [(reversed & 0x01) !== 0, (reversed & 0x02) !== 0],
    air: normalizeAirPairs(decodeAirBits(swappedIr)),
    slider: rawSlider.slice().reverse(),
    raw: {
      header: Array.from(bytes.slice(0, 3)),
      irButtons,
      reversedBits: reversed,
      sliderPacket: rawSlider,
    },
  };
}

function readU16Le(bytes, offset) {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

function readU16Be(bytes, offset) {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function parseIo4Input(reportId, bytes) {
  if (reportId !== 1 || bytes.length < 63) {
    return null;
  }

  const analog = Array.from({ length: 8 }, (_unused, index) =>
    readU16Le(bytes, index * 2)
  );
  const rotary = Array.from({ length: 4 }, (_unused, index) =>
    readU16Le(bytes, 16 + index * 2)
  );
  const coins = [
    readU16Be(bytes, 24),
    readU16Be(bytes, 26),
  ];
  const buttonWords = [
    readU16Le(bytes, 28),
    readU16Le(bytes, 30),
  ];
  const systemStatus = bytes[32] ?? 0;
  const usbStatus = bytes[33] ?? 0;
  const airSignals = [
    { word: 0, bit: 13, label: "AIR 1" },
    { word: 1, bit: 13, label: "AIR 2" },
    { word: 0, bit: 12, label: "AIR 3" },
    { word: 1, bit: 12, label: "AIR 4" },
    { word: 0, bit: 11, label: "AIR 5" },
    { word: 1, bit: 11, label: "AIR 6" },
  ];
  const air = airSignals.map(({ word, bit }) =>
    ((buttonWords[word] & (1 << bit)) === 0) ? 255 : 0
  );

  return {
    buttons: [
      (buttonWords[0] & (1 << 6)) !== 0,
      (buttonWords[0] & (1 << 9)) !== 0,
    ],
    air,
    slider: analogToSlider(analog),
    raw: {
      reportId,
      analog,
      rotary,
      coins,
      buttonWords,
      systemStatus,
      usbStatus,
      airSignals,
      unique: Array.from(bytes.slice(34, 63)),
    },
  };
}

function analogToSlider(analog) {
  const slider = Array(32).fill(0);
  analog.forEach((value, index) => {
    const scaled = Math.max(0, Math.min(255, Math.round(value / 4)));
    for (let cell = 0; cell < 4; cell++) {
      slider[index * 4 + cell] = scaled;
    }
  });
  return slider;
}

function isTasollerOptionsIdleFrame(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0x00) {
    return false;
  }

  const head = bytes[1];
  if (head !== 0xc0 && head !== 0xd0 && head !== 0xe0 && head !== 0xf0) {
    return false;
  }

  for (let index = 2; index < bytes.length; index++) {
    if (bytes[index] !== 0x00) {
      return false;
    }
  }

  return true;
}

function parseTasollerOptionsDbt(bytes) {
  if (bytes.length < 55 || bytes[0] !== 0x00 ||
      bytes[1] !== 0x44 || bytes[2] !== 0x42 || bytes[3] !== 0x54) {
    return null;
  }

  const status = Array.from(bytes.slice(51, 55));
  const airMask = bytes[4] & 0x3f;
  const touchProbe = bytes[6];
  const buttons = [];
  for (const value of status) {
    for (let bit = 0; bit < 4; bit++) {
      buttons.push((value & (1 << bit)) !== 0);
    }
  }

  const bitText = status
    .map((value) => value.toString(2).padStart(4, "0"))
    .join(" ");

  return {
    air: decodeAirBits(airMask),
    buttons,
    buttonLabels: status.flatMap((_value, group) =>
      [0, 1, 2, 3].map((bit) => `DBT${group}.${bit}`)
    ),
    raw: { airMask, touchProbe, status },
    summaryKey: `dbt:${airMask}:${status.join(",")}`,
    summary: `DBT air[4]=${airMask.toString(16).padStart(2, "0")} touch[6]=${touchProbe.toString(16).padStart(2, "0")} status[51..54]=${formatHex(status)} bits=${bitText}`,
  };
}

function parseTasollerOptionsAnalog(bytes) {
  if (bytes.length < 59 || bytes[0] !== 0x00 || bytes[1] !== 0xf0) {
    return null;
  }

  const values = [
    (bytes[49] << 8) | bytes[50],
    (bytes[51] << 8) | bytes[52],
    (bytes[57] << 8) | bytes[58],
    (bytes[59] << 8) | bytes[60],
  ];

  if (values.every((value) => value === 0)) {
    return null;
  }

  return {
    raw: { values },
    summaryKey: "f0",
    summary: `F0 analog values=${values.join(" / ")}`,
  };
}

function parseTasollerOptionsNonzero(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0x00) {
    return null;
  }

  const head = bytes[1];
  if (head !== 0xc0 && head !== 0xd0 && head !== 0xe0 && head !== 0xf0) {
    return null;
  }

  const nonzero = [];
  for (let index = 2; index < bytes.length; index++) {
    if (bytes[index] !== 0x00) {
      nonzero.push([index, bytes[index]]);
    }
  }

  if (!nonzero.length) {
    return null;
  }

  const compact = nonzero
    .slice(0, 10)
    .map(([index, value]) => `${index}:${value.toString(16).padStart(2, "0")}`)
    .join(" ");

  return {
    raw: { nonzero },
    summaryKey: `${head.toString(16)}:${compact}`,
    summary: `${head.toString(16).toUpperCase()} nonzero ${compact}`,
  };
}

function buildGrid() {
  const sliderRoot = document.querySelector("#slider-grid");
  const optionsSliderRoot = document.querySelector("#options-slider-grid");
  const airRoot = document.querySelector("#air-grid");
  const optionsAirRoot = document.querySelector("#options-air-grid");
  const sliderTemplate = document.querySelector("#slider-cell-template");
  const airTemplate = document.querySelector("#air-cell-template");

  for (let column = 0; column < 16; column++) {
    const pair = document.createElement("div");
    pair.className = "slider-pair";

    const topIndex = column * 2;
    const bottomIndex = topIndex + 1;

    for (const index of [topIndex, bottomIndex]) {
      const node = sliderTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.index = String(index);
      node.querySelector(".index").hidden = true;
      node.querySelector(".value").textContent = "0";
      pair.appendChild(node);
      ui.sliderCells.push(node);
    }

    sliderRoot.appendChild(pair);
  }

  if (optionsSliderRoot) {
    for (let column = 0; column < 16; column++) {
      const pair = document.createElement("div");
      pair.className = "slider-pair";

      const topIndex = column * 2;
      const bottomIndex = topIndex + 1;

      for (const index of [topIndex, bottomIndex]) {
        const node = sliderTemplate.content.firstElementChild.cloneNode(true);
        node.dataset.index = String(index);
        node.querySelector(".index").hidden = true;
        node.querySelector(".value").textContent = "0";
        pair.appendChild(node);
        ui.optionsSliderCells.push(node);
      }

      optionsSliderRoot.appendChild(pair);
    }
  }

  for (let index = 0; index < 6; index++) {
    const node = airTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.querySelector(".index").textContent = String(6 - index);
    node.querySelector(".value").textContent = "0";
    airRoot.appendChild(node);
    ui.airCells.push(node);
  }

  if (optionsAirRoot) {
    for (let index = 0; index < 6; index++) {
      const node = airTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.index = String(index);
      node.querySelector(".index").textContent = String(6 - index);
      node.querySelector(".value").textContent = "0";
      optionsAirRoot.appendChild(node);
      ui.optionsAirCells.push(node);
    }
  }
}

function setStatusKey(key, isError = false) {
  state.connectionKey = key;
  state.connectionText = "";
  ui.connectionStatus.textContent = t(key);
  ui.connectionStatus.style.color = isError ? "var(--warn)" : "";
}

function setStatus(text, isError = false) {
  state.connectionKey = "";
  state.connectionText = text;
  ui.connectionStatus.textContent = text;
  ui.connectionStatus.style.color = isError ? "var(--warn)" : "";
}

function setLightStatusKey(key, params = {}) {
  state.lightStatusKey = key;
  state.lightStatusText = t(key, params);
  ui.lightStatus.textContent = state.lightStatusText;
}

function setLightStatus(text) {
  state.lightStatusKey = "";
  state.lightStatusText = text;
  if (ui.lightStatus.textContent !== text) {
    ui.lightStatus.textContent = text;
  }
}

function updateButtonLayout(labels) {
  ui.buttonStack.innerHTML = "";
  ui.buttonIndicators = [];

  labels.forEach((label, index) => {
    const node = ui.buttonTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.querySelector(".label").textContent = label;
    node.querySelector(".value").textContent = "0";
    ui.buttonStack.appendChild(node);
    ui.buttonIndicators.push(node);
  });
}

function updateOptionsButtonLayout(labels) {
  if (!ui.optionsButtonStack) {
    return;
  }

  ui.optionsButtonStack.innerHTML = "";
  ui.optionsButtonIndicators = [];

  labels.forEach((label, index) => {
    const node = ui.buttonTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.querySelector(".label").textContent = label;
    node.querySelector(".value").textContent = "0";
    ui.optionsButtonStack.appendChild(node);
    ui.optionsButtonIndicators.push(node);
  });
}

function updateLightControls() {
  ui.cardLightControl.hidden = !(currentAdapter && currentAdapter.hasCardLight());
  ui.yubideckCardPanel.hidden = !(currentAdapter && currentAdapter.hasCardLight());
}

function formatHex(bytes) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(" ");
}

function hexByte(value) {
  return `0x${(value & 0xff).toString(16).padStart(2, "0")}`;
}

function asciiBytes(text) {
  return Array.from(text, (char) => char.charCodeAt(0) & 0xff);
}

function arraysEqual(left, right) {
  if (!left || !right || left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeReaderVersion(bytes) {
  if (!bytes?.length) {
    return "-";
  }
  const printable = bytes.every((value) => value >= 0x20 && value <= 0x7e);
  if (!printable) {
    return formatHex(bytes);
  }
  return new TextDecoder("ascii").decode(Uint8Array.from(bytes)).replace(/\0+$/g, "");
}

function extractHinataFirmware(bytes) {
  if (!bytes || bytes.length < 10) {
    return "";
  }
  const text = new TextDecoder("ascii").decode(Uint8Array.from(bytes.slice(0, 10)));
  return /^\d{10}$/.test(text) ? text : "";
}

function encodeSgFrame(frame) {
  const checksum = frame.reduce((sum, value) => (sum + value) & 0xff, 0);
  const encoded = [SG_SYNC];
  [...frame, checksum].forEach((value) => {
    if (value === SG_SYNC || value === SG_ESCAPE) {
      encoded.push(SG_ESCAPE, (value - 1) & 0xff);
    } else {
      encoded.push(value);
    }
  });
  return Uint8Array.from(encoded);
}

function buildPn532Packet(command, payload = []) {
  const data = Array.from(payload);
  const length = data.length + 2;
  const packet = [
    0x00,
    0x00,
    0xff,
    length,
    (-length) & 0xff,
    PN532_HOST_TO_DEVICE,
    command,
    ...data,
  ];
  const dcs = (-(packet.slice(5).reduce((sum, value) => (sum + value) & 0xff, 0)) & 0xff);
  packet.push(dcs, 0x00);
  return Uint8Array.from(packet);
}

function buildFelicaEncapPayload(idm, felicaFrame) {
  return [...idm, ...felicaFrame];
}

function buildFelicaReadWithoutEncryption(idm, serviceCode, blockNo) {
  return [
    0x10,
    FELICA_CMD_READ_WITHOUT_ENCRYPTION,
    ...idm,
    0x01,
    serviceCode & 0xff,
    (serviceCode >> 8) & 0xff,
    0x01,
    0x80,
    blockNo & 0xff,
  ];
}

function parseFelicaReadWithoutEncryptionResponse(payload, expectedIdm) {
  if (!payload?.length) {
    throw new Error(t("aime.error.felicaEmptyResponse"));
  }

  const length = payload[0];
  const frame = payload.slice(0, length || payload.length);
  if (frame.length < 13) {
    throw new Error(t("aime.error.felicaShortResponse"));
  }
  if (frame[1] !== FELICA_CMD_READ_WITHOUT_ENCRYPTION_RESPONSE) {
    throw new Error(t("aime.error.felicaUnexpectedResponse", { command: hexByte(frame[1]) }));
  }
  if (!arraysEqual(frame.slice(2, 10), expectedIdm)) {
    throw new Error(t("aime.error.felicaIdmMismatch"));
  }
  if (frame[10] !== 0 || frame[11] !== 0) {
    throw new Error(t("aime.error.felicaStatus", { status: formatHex(frame.slice(10, 12)) }));
  }

  const blockCount = frame[12];
  if (blockCount < 1 || frame.length < 13 + 16 * blockCount) {
    throw new Error(t("aime.error.felicaBlockTruncated"));
  }

  return frame.slice(13, 29);
}

function describeFelicaCard(idm, pmm) {
  const manufacturerOk = arraysEqual(idm?.slice(0, 2), AICC_FELICA_MANUFACTURER);
  const osVersion = pmm?.[1];
  const osLabel = felicaOsVersionLabel(osVersion);
  const valid = manufacturerOk && AICC_FELICA_SUPPORTED_OS_VERSIONS.has(osVersion);
  const label = osLabel || `OS ${hexByte(osVersion ?? 0)}`;
  const reason = [
    manufacturerOk
      ? t("aime.felica.reason.aiccManufacturer")
      : t("aime.felica.reason.nonAiccManufacturer", { manufacturer: formatHex(idm?.slice(0, 2) ?? []) }),
    osLabel
      ? t("aime.felica.reason.pmmOs", { os: hexByte(osVersion), model: osLabel })
      : t("aime.felica.reason.unsupportedPmmOs", { os: hexByte(osVersion ?? 0) }),
  ].join(", ");

  return { valid, label, reason };
}

function felicaOsVersionLabel(osVersion) {
  switch (osVersion) {
    case 0x06:
    case 0x07:
      return t("aime.felica.model.mobileV1");
    case 0x10:
    case 0x12:
    case 0x13:
      return t("aime.felica.model.mobileV2");
    case 0x14:
    case 0x15:
      return t("aime.felica.model.mobileV3");
    case 0x17:
      return t("aime.felica.model.mobileV4");
    case 0x18:
      return t("aime.felica.model.mobileV41");
    case 0x20:
      return t("aime.felica.model.stdRcS962");
    case 0xf0:
      return t("aime.felica.model.liteRcS965");
    case 0xf1:
      return t("aime.felica.model.liteSRcS966");
    case 0xf2:
      return t("aime.felica.model.linkLiteSRcS967");
    case 0xf3:
    case 0xf4:
    case 0xf5:
    case 0xf6:
    case 0xf7:
      return t("aime.felica.model.unknownAicc");
    default:
      return "";
  }
}

function isValidAccessCode(text) {
  return /^\d{20}$/.test(text);
}

function normalizeCardHex(bytes) {
  return Array.from(bytes ?? [], (value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function deriveMinimeAccessCode(idm) {
  const hex = normalizeCardHex(idm);
  if (!/^[0-9A-F]{16}$/.test(hex)) {
    return "";
  }
  return BigInt(`0x${hex}`).toString(10).padStart(20, "0");
}

function deriveZhouAccessCode(idm) {
  const hex = normalizeCardHex(idm);
  if (!/^[0-9A-F]{16}$/.test(hex) && !/^[0-9A-F]{12}$/.test(hex)) {
    return "";
  }
  const first = hex.length === 16 ? hex.slice(4, 10) : hex.slice(0, 6);
  const second = hex.length === 16 ? hex.slice(10, 16) : hex.slice(6, 12);
  return `0200${Number.parseInt(first, 16).toString(10).padStart(8, "0")}${Number.parseInt(second, 16).toString(10).padStart(8, "0")}`;
}

function buildFelicaCardNumbers(idm, accessCode = "") {
  const rawIdm = normalizeCardHex(idm);
  return [
    [t("aime.cardNumber.accessCode"), accessCode],
    [t("aime.cardNumber.minime"), deriveMinimeAccessCode(idm)],
    [t("aime.cardNumber.zhou"), deriveZhouAccessCode(idm)],
    [t("aime.cardNumber.konami"), encodeEpassCardId(rawIdm)],
    [t("aime.cardNumber.idm"), rawIdm],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => ({ label, value }));
}

function renderAimeCardNumbers(entries) {
  ui.aimeCardValue.replaceChildren();
  if (!entries.length) {
    ui.aimeCardValue.textContent = "-";
    return;
  }

  for (const entry of entries) {
    const row = document.createElement("div");
    row.className = "card-number-row";

    const text = document.createElement("div");
    text.className = "card-number-text";

    const label = document.createElement("span");
    label.className = "card-number-label";
    label.textContent = entry.label;

    const value = document.createElement("strong");
    value.className = "card-number-value";
    value.textContent = entry.value;

    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy-card-number";
    copy.dataset.copyValue = entry.value;
    copy.textContent = t("action.copy");
    copy.setAttribute("aria-label", t("aime.copyCardNumber", { label: entry.label }));

    text.append(label, value);
    row.append(text, copy);
    ui.aimeCardValue.append(row);
  }
}

function showFelicaCardNumbers(idm, cardInfo, accessCode = "") {
  ui.aimeCardType.textContent = accessCode
    ? t("aime.card.felicaAccessCode", { model: cardInfo.label })
    : t("aime.card.felicaModel", { model: cardInfo.label });
  renderAimeCardNumbers(buildFelicaCardNumbers(idm, accessCode));
}

async function lookupFelicaAccessCode(idm, pmm, spad0, cardInfo, accessCode = "") {
  const lookupSeq = ++state.aimeLookupSeq;
  const idmHex = normalizeCardHex(idm);
  const pmmHex = normalizeCardHex(pmm);
  const spad0Hex = normalizeCardHex(spad0).toLowerCase();
  const body = { idm: idmHex, pmm: pmmHex };
  if (/^[0-9a-f]{32}$/.test(spad0Hex)) {
    body.spad0 = spad0Hex;
  }

  try {
    const response = await fetch("https://api.jinale.com/api/felica/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return;
    }
    const json = await response.json();
    const lookupCode = Number(json?.code || 0) > 0 ? String(json?.data || "") : "";
    if (lookupSeq === state.aimeLookupSeq && lookupCode) {
      showFelicaCardNumbers(idm, cardInfo, lookupCode);
    }
    return lookupCode;
  } catch (_error) {
    return "";
  }
}

function parsePn532FelicaTarget(payload) {
  if (!payload?.length || payload[0] < 1) {
    return null;
  }

  const target = payload[1] || 1;
  for (let offset = 2; offset <= payload.length - 18; offset++) {
    const commandOffset = payload[offset] === 0x01 ? offset : payload[offset + 1] === 0x01 ? offset + 1 : -1;
    if (commandOffset < 0 || commandOffset + 17 >= payload.length) {
      continue;
    }
    return {
      target,
      idm: payload.slice(commandOffset + 1, commandOffset + 9),
      pmm: payload.slice(commandOffset + 9, commandOffset + 17),
    };
  }

  return null;
}

function decodeSgResponseBytes(rawBytes) {
  const raw = Array.from(rawBytes);
  const sync = raw.indexOf(SG_SYNC);
  if (sync < 0) {
    throw new Error("SEGA frame missing sync");
  }

  const plain = [];
  let escaped = false;
  for (let index = sync + 1; index < raw.length; index++) {
    let value = raw[index];
    if (escaped) {
      value = (value + 1) & 0xff;
      escaped = false;
    } else if (value === SG_ESCAPE) {
      escaped = true;
      continue;
    } else if (value === SG_SYNC) {
      break;
    }
    plain.push(value);
    if (plain.length > 0 && plain.length === plain[0] + 1) {
      break;
    }
  }

  if (plain.length < 7) {
    throw new Error("SEGA frame too short");
  }
  const frameLength = plain[0];
  if (plain.length !== frameLength + 1) {
    throw new Error("SEGA frame length mismatch");
  }
  const frame = plain.slice(0, -1);
  const expected = plain[plain.length - 1];
  const checksum = frame.reduce((sum, value) => (sum + value) & 0xff, 0);
  if (checksum !== expected) {
    throw new Error("SEGA frame checksum mismatch");
  }
  const payloadLength = frame[5] ?? 0;
  if (frame.length < 6 + payloadLength) {
    throw new Error("SEGA frame payload truncated");
  }
  return {
    frameLength,
    addr: frame[1],
    seq: frame[2],
    cmd: frame[3],
    status: frame[4],
    payloadLength,
    payload: frame.slice(6, 6 + payloadLength),
    frame,
  };
}

function extractPn532ResponsePayload(rawBytes, expectedCommand) {
  const raw = Array.from(rawBytes);
  for (let offset = 0; offset <= raw.length - 6; offset++) {
    if (raw[offset] !== 0x00 || raw[offset + 1] !== 0x00 || raw[offset + 2] !== 0xff) {
      continue;
    }
    const length = raw[offset + 3];
    const lcs = raw[offset + 4];
    if (((length + lcs) & 0xff) !== 0) {
      continue;
    }
    if (length === 0 && lcs === 0xff) {
      continue;
    }
    const total = 5 + length + 2;
    if (raw.length < offset + total) {
      continue;
    }
    const packet = raw.slice(offset, offset + total);
    const direction = packet[5];
    const responseCommand = ((packet[6] ?? 0) - 1) & 0xff;
    if (direction !== PN532_DEVICE_TO_HOST || responseCommand !== expectedCommand) {
      continue;
    }
    const checksum = packet.slice(5, 5 + length).reduce((sum, value) => (sum + value) & 0xff, 0);
    const dcs = packet[5 + length];
    if (((checksum + dcs) & 0xff) !== 0) {
      continue;
    }
    return packet.slice(7, 5 + length);
  }
  throw new Error("PN532 response not found");
}

function sgCommandName(cmd) {
  switch (cmd) {
    case SG_CMD_GET_FW_VERSION:
      return "GET_FW";
    case SG_CMD_GET_HW_VERSION:
      return "GET_HW";
    case SG_CMD_RADIO_ON:
      return "RADIO_ON";
    case SG_CMD_POLL:
      return "POLL";
    case SG_CMD_MIFARE_SELECT_TAG:
      return "MIFARE_SELECT";
    case SG_CMD_MIFARE_SET_KEY_A:
      return "MIFARE_KEY_A";
    case SG_CMD_MIFARE_AUTHENTICATE_A:
      return "MIFARE_AUTH_A";
    case SG_CMD_MIFARE_SET_KEY_B:
      return "MIFARE_KEY_B";
    case SG_CMD_MIFARE_AUTHENTICATE_B:
      return "MIFARE_AUTH_B";
    case SG_CMD_MIFARE_READ_BLOCK:
      return "MIFARE_READ";
    case SG_CMD_RESET:
      return "RESET";
    case SG_CMD_FELICA_ENCAP:
      return "FELICA_ENCAP";
    case SG_LED_CMD_RESET:
      return "LED_RESET";
    case SG_LED_CMD_GET_INFO:
      return "LED_INFO";
    default:
      return hexByte(cmd);
  }
}

function describeSgRequest(request) {
  return `addr=${hexByte(request.addr)} seq=${hexByte(request.seq)} cmd=${sgCommandName(request.cmd)} payload=${formatHex(request.payload) || "-"}`;
}

function describeSgResponse(response) {
  return `addr=${hexByte(response.addr)} seq=${hexByte(response.seq)} cmd=${sgCommandName(response.cmd)} status=${hexByte(response.status)} payload=${formatHex(response.payload) || "-"}`;
}

function parseSgPollPayload(payload) {
  if (!payload?.length || payload[0] === 0) {
    return null;
  }
  const type = payload[1];
  const idLength = payload[2] ?? 0;
  const id = payload.slice(3, 3 + idLength);

  if (type === 0x10) {
    return { type: "mifare", uid: id };
  }
  if (type === 0x20) {
    return {
      type: "felica",
      idm: id.slice(0, 8),
      pmm: id.slice(8, 16),
    };
  }
  return { type: "unknown", id };
}

function bcdBytesToText(bytes) {
  let text = "";
  for (const byte of bytes) {
    const high = byte >> 4;
    const low = byte & 0x0f;
    if (high > 9 || low > 9) {
      return "";
    }
    text += `${high}${low}`;
  }
  return text;
}

function appendAimeReaderLog(line) {
  const stamp = new Date().toLocaleTimeString();
  state.aimeReaderLog.push(`[${stamp}] ${line}`);
  if (state.aimeReaderLog.length > 80) {
    state.aimeReaderLog.splice(0, state.aimeReaderLog.length - 80);
  }
  renderAimeReaderLog();
}

function renderAimeReaderLog() {
  ui.aimeReaderLog.textContent = state.aimeReaderLog.length
    ? state.aimeReaderLog.join("\n")
    : t("aime.noPackets");
}

function clearAimeReaderLog() {
  state.aimeReaderLog = [];
  renderAimeReaderLog();
}

function clearAimeCardDisplay() {
  state.aimeLookupSeq += 1;
  ui.aimeCardType.textContent = "-";
  ui.aimeCardValue.textContent = "-";
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function copyAimeCardNumber(button) {
  const value = button.dataset.copyValue || "";
  if (!value) {
    return;
  }

  const original = button.textContent;
  try {
    await copyTextToClipboard(value);
    button.textContent = t("action.copied");
    setTimeout(() => {
      button.textContent = original || t("action.copy");
    }, 900);
  } catch (error) {
    appendAimeReaderLog(t("aime.log.copyFailed", { message: error.message || String(error) }));
  }
}

function setAimeReaderStatusKey(key, isError = false) {
  state.aimeReaderStatusKey = key;
  state.aimeReaderStatusText = "";
  ui.aimeReaderStatus.textContent = t(key);
  ui.aimeReaderStatus.style.color = isError ? "var(--warn)" : "";
}

function setAimeReaderStatus(text, isError = false) {
  state.aimeReaderStatusKey = "";
  state.aimeReaderStatusText = text;
  ui.aimeReaderStatus.textContent = text;
  ui.aimeReaderStatus.style.color = isError ? "var(--warn)" : "";
}

function formatAscii(bytes) {
  return Array.from(bytes, (value) =>
    value >= 0x20 && value <= 0x7e ? String.fromCharCode(value) : "."
  ).join("");
}

function renderOptionsLog() {
  if (!state.optionsLog.length) {
    ui.optionsLog.textContent = t("options.noPackets");
    return;
  }

  ui.optionsLog.textContent = state.optionsLog.join("\n");
}

function getTouchThreshold() {
  const value = Number(ui.touchThreshold?.value ?? 20);
  if (!Number.isFinite(value)) {
    return 20;
  }
  return Math.max(1, Math.min(255, Math.round(value)));
}

function setTouchThreshold(value) {
  const threshold = Math.max(1, Math.min(255, Math.round(Number(value) || 20)));
  ui.touchThreshold.value = String(threshold);
  ui.touchThresholdRange.value = String(threshold);
  localStorage.setItem(TOUCH_THRESHOLD_STORAGE_KEY, String(threshold));
  state.activeSliderLeds.fill(false);
  render();
}

function isSliderActiveValue(value) {
  return value >= getTouchThreshold();
}

function clearOptionsLog() {
  state.optionsLog = [];
  state.lastOptionsSummaryKey = "";
  state.lastOptionsReportByHead.clear();
  renderOptionsLog();
}

function setOptionsStatusKey(key, params = {}) {
  state.optionsStatusKey = key;
  state.optionsStatusText = t(key, params);
  ui.optionsStatus.textContent = state.optionsStatusText;
}

function setOptionsStatus(text) {
  state.optionsStatusKey = "";
  state.optionsStatusText = text;
  ui.optionsStatus.textContent = text;
}

function describeOptionsError(error) {
  const message = error?.message || String(error);
  if (message.includes("protected interface class")) {
    return t("options.error.protectedInterface");
  }

  return t("options.error.unavailable", { message });
}

function appendOptionsPacket(bytes, meta = {}) {
  const head = bytes.length >= 4
    ? `i${meta.interfaceNumber ?? "?"}/ep${meta.endpointNumber ?? "?"} head=${bytes[0].toString(16).padStart(2, "0")}/${bytes[1].toString(16).padStart(2, "0")}/${bytes[2].toString(16).padStart(2, "0")}/${bytes[3].toString(16).padStart(2, "0")}`
    : `i${meta.interfaceNumber ?? "?"}/ep${meta.endpointNumber ?? "?"}`;
  const line = `${head}\nHEX  ${formatHex(bytes)}\nASCII ${formatAscii(bytes)}`;
  if (state.optionsLog.length === 0 || state.optionsLog[0] !== line) {
    console.log("[TASOLLER Options packet]", line);
    state.optionsLog = [line, ...state.optionsLog].slice(0, 40);
  }
  setOptionsStatus(t("options.status.capturedPackets", { count: state.optionsLog.length }));
  renderOptionsLog();
}

function isKnownOptionsDeltaNoise(bytes, index) {
  const head = bytes[1];
  if (head === 0x44) {
    return index === 4 || index === 6 || (index >= 51 && index <= 54);
  }

  if (head === 0xf0) {
    return index === 49 || index === 50 ||
      index === 51 || index === 52 ||
      index === 57 || index === 58 ||
      index === 59 || index === 60;
  }

  return false;
}

function appendOptionsDelta(bytes, meta = {}) {
  if (bytes.length < 4) {
    return;
  }

  const headKey = `${meta.endpointNumber ?? "?"}:${bytes[0]}:${bytes[1]}:${bytes[2]}:${bytes[3]}`;
  const previousBytes = state.lastOptionsReportByHead.get(headKey);
  state.lastOptionsReportByHead.set(headKey, Uint8Array.from(bytes));

  if (!previousBytes || previousBytes.length !== bytes.length) {
    return;
  }

  const changes = [];
  for (let index = 0; index < bytes.length; index++) {
    if (previousBytes[index] !== bytes[index] && !isKnownOptionsDeltaNoise(bytes, index)) {
      changes.push([index, previousBytes[index], bytes[index]]);
    }
  }

  if (!changes.length) {
    return;
  }

  const head = bytes.length >= 4
    ? `${bytes[0].toString(16).padStart(2, "0")}/${bytes[1].toString(16).padStart(2, "0")}/${bytes[2].toString(16).padStart(2, "0")}/${bytes[3].toString(16).padStart(2, "0")}`
    : "";
  const compact = changes
    .slice(0, 18)
    .map(([index, oldValue, newValue]) =>
      `${index}:${oldValue.toString(16).padStart(2, "0")}>${newValue.toString(16).padStart(2, "0")}`
    )
    .join(" ");
  const suffix = changes.length > 18 ? ` ... +${changes.length - 18}` : "";
  const key = `delta:${meta.endpointNumber ?? "?"}:${head}:${compact}:${changes.length}`;

  appendOptionsSummary(
    key,
    `HID delta ep${meta.endpointNumber ?? "?"} head=${head} changed=${changes.length} ${compact}${suffix}`
  );
}

function appendOptionsSummary(key, text) {
  if (state.lastOptionsSummaryKey === key) {
    setOptionsStatus(text);
    return;
  }

  state.lastOptionsSummaryKey = key;
  console.log("[TASOLLER Options]", text);
  state.optionsLog = [text, ...state.optionsLog].slice(0, 40);
  setOptionsStatus(text);
  renderOptionsLog();
}

function appendOptionsMessage(text) {
  console.log("[TASOLLER Options]", text);
  state.optionsLog = [text, ...state.optionsLog].slice(0, 40);
  renderOptionsLog();
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function summarizeHidCollections(device) {
  const collections = device.collections ?? [];
  if (!collections.length) {
    return "HID collections: none";
  }

  return collections
    .map((collection, index) => {
      const inputCount = collection.inputReports?.length ?? 0;
      const outputCount = collection.outputReports?.length ?? 0;
      const featureCount = collection.featureReports?.length ?? 0;
      const inputIds = (collection.inputReports ?? [])
        .map((report) => report.reportId ?? 0)
        .join(",");
      const outputIds = (collection.outputReports ?? [])
        .map((report) => report.reportId ?? 0)
        .join(",");
      const featureIds = (collection.featureReports ?? [])
        .map((report) => report.reportId ?? 0)
        .join(",");
      return [
        `col${index}`,
        `usagePage=0x${(collection.usagePage ?? 0).toString(16)}`,
        `usage=0x${(collection.usage ?? 0).toString(16)}`,
        `input=${inputCount}${inputCount ? `[${inputIds}]` : ""}`,
        `output=${outputCount}${outputCount ? `[${outputIds}]` : ""}`,
        `feature=${featureCount}${featureCount ? `[${featureIds}]` : ""}`,
      ].join(" ");
    })
    .join("\n");
}

function updateOptionsControls() {
  const supported = Boolean(currentAdapter && currentAdapter.supportsOptionsTest());
  ui.optionsPanel.hidden = !supported;

  if (!supported) {
    ui.optionsInterfaceValue.textContent = "-";
    ui.optionsEndpointsValue.textContent = "-";
    ui.optionsModeValue.textContent = "-";
    setOptionsStatusKey("status.idle");
    return;
  }

  ui.optionsModeValue.textContent = tasollerPlusModeLabel(currentAdapter.productId);

  const info = currentAdapter.getOptionsInfo?.();
  if (!info) {
    ui.optionsInterfaceValue.textContent = t("status.notConnected");
    ui.optionsEndpointsValue.textContent = t("options.webhidOnDemand");
    return;
  }

  ui.optionsInterfaceValue.textContent =
    info.transport === "webhid"
      ? "WebHID"
      : `#${info.interfaceNumber}`;
  ui.optionsEndpointsValue.textContent =
    (info.transport === "webhid"
      ? t("options.hidReports")
      : `IN ${info.inEndpoint}` +
        (info.outEndpoint !== null ? ` / OUT ${info.outEndpoint}` : "")) +
    (info.interfaceClass !== null
      ? ` / CLS ${info.interfaceClass.toString(16).padStart(2, "0")}`
      : "");
}

function resetState() {
  state.slider.fill(0);
  state.air.fill(0);
  state.buttons = [];
  state.optionsAir.fill(null);
  state.optionsSlider.fill(0);
  state.optionsButtons = [];
  state.cardStatus = 0;
  state.cardId = [];
  state.activeSliderLeds.fill(false);
  state.touchComHeldSlider.fill(0);
  state.touchComZeroFrames.fill(0);
  state.touchComLastActiveAt.fill(0);
  state.lastTouchComNonEmptyAt = 0;
  clearOptionsLog();
  state.raw = {};
  render();
}

function applyControllerState(next) {
  if (!touchSerialAdapter?.connected && Array.isArray(next.slider)) {
    state.slider = next.slider.slice(0, 32);
  }
  state.air = next.air.slice(0, 6);
  state.buttons = Array.isArray(next.buttons) ? next.buttons.slice() : [];
  state.cardStatus = next.cardStatus ?? 0;
  state.cardId = Array.isArray(next.cardId) ? next.cardId.slice(0, 10) : [];
  state.raw = next.raw ?? {};
  render();
}

function applyOptionsControllerState(next) {
  if (Array.isArray(next.air)) {
    state.optionsAir = next.air.slice(0, 6);
  }
  if (Array.isArray(next.slider)) {
    state.optionsSlider = next.slider.slice(0, 32);
  }
  if (Array.isArray(next.buttonLabels) &&
      next.buttonLabels.length !== ui.optionsButtonIndicators.length) {
    updateOptionsButtonLayout(next.buttonLabels);
  }
  if (Array.isArray(next.buttons)) {
    state.optionsButtons = next.buttons.slice();
  }
  render();
}

function render() {
  let activeCount = 0;
  let optionsActiveCount = 0;

  ui.sliderCells.forEach((cell, index) => {
    const sourceIndex = (index & 1) === 0 ? index + 1 : index - 1;
    const value = state.slider[sourceIndex] ?? 0;
    const active = isSliderActiveValue(value);
    if (active) {
      activeCount += 1;
    }

    cell.querySelector(".value").textContent = String(value);
    cell.classList.toggle("active", active);

    const alpha = Math.min(0.18 + (value / 255) * 0.5, 0.68);
    cell.style.background = active
      ? `linear-gradient(180deg, rgba(18, 247, 207, ${alpha}), rgba(15, 61, 85, 0.88))`
      : "";
  });

  ui.airCells.forEach((cell, index) => {
    const value = state.air[5 - index] ?? 0;
    const active = value > 0;
    if (active) {
      activeCount += 1;
    }

    cell.querySelector(".value").textContent = String(value);
    cell.classList.toggle("active", active);

    const fill = cell.querySelector(".fill");
    fill.style.width = `${active ? Math.max(4, (value / 255) * 100) : 0}%`;
    fill.style.opacity = active ? "1" : "0.18";
  });

  ui.buttonIndicators.forEach((indicator, index) => {
    const active = Boolean(state.buttons[index]);
    if (active && !indicator.hidden) {
      activeCount += 1;
    }

    indicator.classList.toggle("active", active);
    indicator.querySelector(".value").textContent = active ? "1" : "0";
  });

  ui.optionsAirCells.forEach((cell, index) => {
    const value = state.optionsAir[5 - index];
    const active = typeof value === "number" && value > 0;
    if (active) {
      optionsActiveCount += 1;
    }

    cell.querySelector(".value").textContent =
      typeof value === "number" ? String(value) : "-";
    cell.classList.toggle("active", active);

    const fill = cell.querySelector(".fill");
    fill.style.width = `${active ? Math.max(4, Math.min(value / 6, 100)) : 0}%`;
    fill.style.opacity = active ? "1" : "0.18";
  });

  ui.optionsSliderCells.forEach((cell, index) => {
    const sourceIndex = (index & 1) === 0 ? index + 1 : index - 1;
    const value = state.optionsSlider[sourceIndex] ?? 0;
    const active = isSliderActiveValue(value);
    if (active) {
      optionsActiveCount += 1;
    }

    cell.querySelector(".value").textContent = String(value);
    cell.classList.toggle("active", active);

    const alpha = Math.min(0.18 + (value / 600) * 0.5, 0.68);
    cell.style.background = active
      ? `linear-gradient(180deg, rgba(18, 247, 207, ${alpha}), rgba(15, 61, 85, 0.88))`
      : "";
  });

  ui.optionsButtonIndicators.forEach((indicator, index) => {
    const active = Boolean(state.optionsButtons[index]);
    if (active) {
      optionsActiveCount += 1;
    }

    indicator.classList.toggle("active", active);
    indicator.querySelector(".value").textContent = active ? "1" : "0";
  });

  ui.activeSummary.textContent = t("summary.activeInputs", { count: activeCount });
  if (ui.optionsActiveSummary) {
    ui.optionsActiveSummary.textContent = t("summary.activeInputs", { count: optionsActiveCount });
  }
  ui.cardStatusValue.textContent = String(state.cardStatus);
  ui.cardIdValue.textContent = state.cardId.length
    ? state.cardId.map((value) => value.toString(16).padStart(2, "0")).join(" ")
    : "-";
  ui.cardTestStatus.textContent = state.cardStatus !== 0 ? t("card.detected") : t("status.idle");
}

let currentAdapter = null;
let touchSerialAdapter = null;
let aimeReaderAdapter = null;
let lightLoopTimer = null;
let lightLoopBusy = false;
let lastLightPayloadKey = "";
let lastLightSendAt = 0;

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function hexToReaderRgb(hex) {
  const color = hexToRgb(hex);
  return [color.r, color.g, color.b].map((value) =>
    Number.isFinite(value) ? Math.max(0, Math.min(255, value)) : 0
  );
}

function readerLedBrightness() {
  const value = Number(ui.aimeReaderLedBrightness?.value || 100);
  return Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 100;
}

function scaleReaderLedRgb(rgb) {
  const scale = readerLedBrightness() / 100;
  return rgb.map((value) => Math.max(0, Math.min(255, Math.round(value * scale))));
}

function selectedReaderLedRgb() {
  return scaleReaderLedRgb(hexToReaderRgb(ui.aimeReaderLedColor?.value || "#ffffff"));
}

function updateReaderLedBrightnessLabel() {
  if (ui.aimeReaderLedBrightnessValue) {
    ui.aimeReaderLedBrightnessValue.textContent = `${readerLedBrightness()}%`;
  }
}

function cloneColor(color) {
  return { r: color.r, g: color.g, b: color.b };
}

function getGapIndices(mode) {
  switch (mode) {
    case "4k":
      return [7, 15, 23];
    case "8k":
      return [3, 7, 11, 15, 19, 23, 27];
    case "16k":
      return Array.from({ length: 15 }, (_unused, index) => index * 2 + 1);
    default:
      return [];
  }
}

function sliderLedIsActive(index) {
  if ((index & 1) !== 0) {
    return false;
  }

  const keyIndex = index / 2;
  const topSensor = state.slider[31 - keyIndex * 2] ?? 0;
  const bottomSensor = state.slider[30 - keyIndex * 2] ?? 0;
  const sensorValue = Math.max(topSensor, bottomSensor);
  const active = isSliderActiveValue(sensorValue);
  state.activeSliderLeds[index] = active;
  return active;
}

function lightingPayloadKey(lighting) {
  const parts = [];
  lighting.slider.forEach((color) => {
    parts.push(color.r, color.g, color.b);
  });
  parts.push(
    lighting.leftAir.r,
    lighting.leftAir.g,
    lighting.leftAir.b,
    lighting.rightAir.r,
    lighting.rightAir.g,
    lighting.rightAir.b,
    lighting.card.r,
    lighting.card.g,
    lighting.card.b
  );
  return parts.join(",");
}

function buildLightingPayload(mode) {
  const sliderBaseColor = hexToRgb(ui.colorSlider.value);
  const sliderActiveColor = hexToRgb(ui.colorSliderActive.value);
  const gapColor = hexToRgb(ui.colorGap.value);
  const gapMode = ui.gapMode.value;
  const leftAir = hexToRgb(ui.colorLeftAir.value);
  const rightAir = hexToRgb(ui.colorRightAir.value);
  const card = hexToRgb(ui.colorCard.value);

  const off = { r: 0, g: 0, b: 0 };
  const slider = Array.from({ length: 31 }, () => cloneColor(off));

  if (mode !== "clear") {
    for (let index = 0; index < 31; index++) {
      slider[index] = cloneColor(sliderBaseColor);
    }

    for (const index of getGapIndices(gapMode)) {
      if (index >= 0 && index < slider.length) {
        slider[index] = cloneColor(gapColor);
      }
    }

    if (mode === "active") {
      for (let index = 0; index < 31; index++) {
        if (sliderLedIsActive(index)) {
          slider[index] = cloneColor(sliderActiveColor);
        }
      }
    }
  }

  return {
    slider,
    leftAir: mode === "clear" ? off : leftAir,
    rightAir: mode === "clear" ? off : rightAir,
    card: mode === "clear" ? off : card,
  };
}

function stopLightLoop() {
  if (lightLoopTimer !== null) {
    clearTimeout(lightLoopTimer);
    lightLoopTimer = null;
  }
  lightLoopBusy = false;
  lastLightPayloadKey = "";
  lastLightSendAt = 0;
}

function startLightLoop() {
  stopLightLoop();
  lightLoopTimer = setInterval(async () => {
    if ((!currentAdapter && !touchSerialAdapter?.connected) || lightLoopBusy) {
      return;
    }

    try {
      lightLoopBusy = true;
      const lighting = buildLightingPayload(state.lightMode);
      const payloadKey = lightingPayloadKey(lighting);
      const now = performance.now();
      const continuous = Boolean(
        currentAdapter?.wantsContinuousLightRefresh?.()
      );
      const inputDriven = Boolean(
        currentAdapter?.wantsInputDrivenLightRefresh?.()
      );
      if (!continuous &&
          payloadKey === lastLightPayloadKey &&
          now - lastLightSendAt < LIGHT_KEEPALIVE_MS) {
        return;
      }
      const lightErrors = [];
      if (currentAdapter && !inputDriven) {
        try {
          await currentAdapter.writeLights(lighting);
        } catch (error) {
          lightErrors.push(error?.message || String(error));
        }
      }
      if (touchSerialAdapter?.connected) {
        try {
          await touchSerialAdapter.writeLights(lighting);
        } catch (error) {
          lightErrors.push(error?.message || String(error));
        }
      }
      lastLightPayloadKey = payloadKey;
      lastLightSendAt = now;
      if (lightErrors.length && !touchSerialAdapter?.connected) {
        setLightStatus(t("light.error", { message: lightErrors.join(" / ") }));
      } else {
        setLightStatus(t("light.streaming", { mode: t(`mode.${state.lightMode}`) }));
      }
    } catch (error) {
      setLightStatus(t("light.error", { message: error.message }));
    } finally {
      lightLoopBusy = false;
    }
  }, LIGHT_LOOP_INTERVAL_MS);
}

function sendLights(mode) {
  if (!currentAdapter && !touchSerialAdapter?.connected) {
    setLightStatusKey("light.connectFirst");
    return;
  }

  state.lightMode = mode;
  setLightStatus(t("light.armed", { mode: t(`mode.${mode}`) }));
  startLightLoop();
}

async function connectTouchCom() {
  try {
    if (touchSerialAdapter?.connected) {
      await touchSerialAdapter.disconnect();
    }

    touchSerialAdapter = new TouchSerialAdapter();
    touchSerialAdapter.setStatusKey("touch.status.requesting");
    await touchSerialAdapter.connect();
    if (!lightLoopTimer) {
      sendLights(state.lightMode);
    }
  } catch (error) {
    if (!touchSerialAdapter) {
      touchSerialAdapter = new TouchSerialAdapter();
    }
    touchSerialAdapter.setStatus(`Touch COM: ${error.message || String(error)}`, true);
  }
}

async function disconnectTouchCom() {
  if (touchSerialAdapter) {
    await touchSerialAdapter.disconnect();
    touchSerialAdapter = null;
  } else {
    state.touchComStatusKey = "touch.status.disconnected";
    ui.touchComStatus.textContent = t("touch.status.disconnected");
  }
}

async function connectAimeReader() {
  try {
    if (aimeReaderAdapter?.connected) {
      await aimeReaderAdapter.disconnect();
    }
    clearAimeCardDisplay();
    aimeReaderAdapter = new AimeReaderSerialAdapter();
    setAimeReaderStatusKey("aime.status.requesting");
    await aimeReaderAdapter.connect(Number(ui.aimeReaderBaud.value) || AIME_READER_DEFAULT_BAUD);
  } catch (error) {
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
  }
}

async function connectHinataReader() {
  try {
    if (aimeReaderAdapter?.connected) {
      await aimeReaderAdapter.disconnect();
    }
    clearAimeCardDisplay();
    aimeReaderAdapter = new HinataHidReaderAdapter();
    setAimeReaderStatusKey("aime.status.requesting");
    await aimeReaderAdapter.connect();
  } catch (error) {
    setAimeReaderStatus(`Hinata HID: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function connectHinataUsbReader() {
  try {
    if (aimeReaderAdapter?.connected) {
      await aimeReaderAdapter.disconnect();
    }
    clearAimeCardDisplay();
    aimeReaderAdapter = new HinataUsbReaderAdapter();
    setAimeReaderStatusKey("aime.status.requesting");
    await aimeReaderAdapter.connect();
  } catch (error) {
    setAimeReaderStatus(`Hinata WebUSB: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function connectSelectedAimeReader() {
  const mode = ui.aimeReaderMode?.value || "aime-com";
  if (mode === "hinata-sega") {
    await connectHinataUsbReader();
  } else {
    await connectAimeReader();
  }
  if (aimeReaderAdapter?.connected) {
    await aimeReaderAdapter.runProbe();
  }
}

async function disconnectAimeReader() {
  if (aimeReaderAdapter) {
    await aimeReaderAdapter.setReaderLed?.([0x00, 0x00, 0x00], "off", { silent: true }).catch(() => {});
    await aimeReaderAdapter.disconnect();
    aimeReaderAdapter = null;
  } else {
    setAimeReaderStatusKey("aime.status.disconnected");
  }
}

async function ensureAimeReaderConnected() {
  if (!aimeReaderAdapter?.connected) {
    await connectSelectedAimeReader();
  }
  if (!aimeReaderAdapter?.connected) {
    throw new Error(t("aime.error.notConnected"));
  }
  return aimeReaderAdapter;
}

async function runAimeReaderProbe() {
  try {
    const adapter = await ensureAimeReaderConnected();
    await adapter.runProbe();
  } catch (error) {
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function pollAimeReaderOnce() {
  try {
    const adapter = await ensureAimeReaderConnected();
    await adapter.pollCardOnce();
  } catch (error) {
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function scanAimeReaderTimed() {
  try {
    const adapter = await ensureAimeReaderConnected();
    await adapter.runTimedReaderScan();
  } catch (error) {
    await aimeReaderAdapter?.setReaderLed?.([0xff, 0x00, 0x00], "scan-error", { silent: true }).catch(() => {});
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function sendAimeReaderLedColor() {
  try {
    const adapter = await ensureAimeReaderConnected();
    const rgb = selectedReaderLedRgb();
    await adapter.setReaderLed(rgb, "manual");
  } catch (error) {
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function clearAimeReaderLedColor() {
  try {
    const adapter = await ensureAimeReaderConnected();
    await adapter.setReaderLed([0x00, 0x00, 0x00], "off");
  } catch (error) {
    setAimeReaderStatus(`Reader COM: ${error.message || String(error)}`, true);
    appendAimeReaderLog(t("aime.log.error", { message: error.message || String(error) }));
  }
}

async function connectWith(factory) {
  try {
    if (currentAdapter) {
      await currentAdapter.disconnect();
      currentAdapter = null;
    }

    resetState();
    currentAdapter = factory();
    ui.deviceName.textContent = currentAdapter.name;
    updateButtonLayout(currentAdapter.getButtonLayout());
    updateOptionsButtonLayout(currentAdapter.getButtonLayout());
    updateLightControls();
    updateOptionsControls();
    setStatusKey("status.connecting");
    await currentAdapter.connect();
    updateOptionsControls();
    setStatusKey("status.connected");
    if (currentAdapter.canStreamLights()) {
      sendLights("active");
    } else {
      setLightStatusKey("light.disabled");
    }
  } catch (error) {
    currentAdapter = null;
    ui.deviceName.textContent = "-";
    updateButtonLayout([]);
    updateOptionsButtonLayout([]);
    updateLightControls();
    updateOptionsControls();
    setStatus(error.message || String(error), true);
  }
}

async function disconnectCurrentDevice() {
  stopLightLoop();
  if (!currentAdapter) {
    resetState();
    ui.deviceName.textContent = "-";
    updateButtonLayout([]);
    updateOptionsButtonLayout([]);
    updateLightControls();
    updateOptionsControls();
    setStatusKey("status.disconnected");
    setLightStatusKey("status.stopped");
    return;
  }

  await currentAdapter.disconnect();
  currentAdapter = null;
  ui.deviceName.textContent = "-";
  updateButtonLayout([]);
  updateOptionsButtonLayout([]);
  updateLightControls();
  updateOptionsControls();
  setStatusKey("status.disconnected");
  setLightStatusKey("status.stopped");
  resetState();
}

async function connectTasollerFamily() {
  if ("usb" in navigator) {
    const usbDevices = await navigator.usb.getDevices();
    const knownUsb = usbDevices.find(
      (device) =>
        (device.vendorId === VENDOR_TASOLLER &&
          device.productId === PRODUCT_TASOLLER) ||
        isTasollerPlusFamily(device)
    );

    if (knownUsb) {
      if (
        knownUsb.vendorId === VENDOR_TASOLLER &&
        knownUsb.productId === PRODUCT_TASOLLER
      ) {
        await connectWith(() => {
          const adapter = new TasollerV1WebUsbAdapter({
            name: "Tasoller (V1)",
            vendorId: VENDOR_TASOLLER,
            productId: PRODUCT_TASOLLER,
            buttonLayout: ["FN1", "FN2"],
            parseInput: parseTasollerInput,
          });
          adapter.device = knownUsb;
          return adapter;
        });
      } else {
        await connectWith(() => {
          const adapter = new TasollerPlusWebUsbAdapter({
            name: tasollerPlusNameForPid(knownUsb.productId),
            vendorId: VENDOR_TASOLLER_PLUS,
            productId: knownUsb.productId,
            buttonLayout: ["FN1", "FN2"],
            parseInput: parseTasollerPlusInput,
          });
          adapter.device = knownUsb;
          return adapter;
        });
      }

      return;
    }

    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: VENDOR_TASOLLER, productId: PRODUCT_TASOLLER },
          ...TASOLLER_PLUS_PRODUCT_IDS.map((productId) => ({
            vendorId: VENDOR_TASOLLER_PLUS,
            productId,
          })),
        ],
      });

      if (
        device.vendorId === VENDOR_TASOLLER &&
        device.productId === PRODUCT_TASOLLER
      ) {
        await connectWith(() => {
          const adapter = new TasollerV1WebUsbAdapter({
            name: "Tasoller (V1)",
            vendorId: VENDOR_TASOLLER,
            productId: PRODUCT_TASOLLER,
            buttonLayout: ["FN1", "FN2"],
            parseInput: parseTasollerInput,
          });
          adapter.device = device;
          return adapter;
        });
      } else {
        await connectWith(() => {
          const adapter = new TasollerPlusWebUsbAdapter({
            name: tasollerPlusNameForPid(device.productId),
            vendorId: VENDOR_TASOLLER_PLUS,
            productId: device.productId,
            buttonLayout: ["FN1", "FN2"],
            parseInput: parseTasollerPlusInput,
          });
          adapter.device = device;
          return adapter;
        });
      }

      return;
    } catch (_error) {
    }
  }

  setStatus(t("error.noTasoller"), true);
}

function bindActions() {
  ui.languageSelect.addEventListener("change", async () => {
    await loadLocale(ui.languageSelect.value);
    updateOptionsControls();
  });

  document.querySelector("#connect-yubideck").addEventListener("click", () => {
    connectWith(() => new YubiDeckWebHidAdapter());
  });

  document.querySelector("#connect-tasoller-family").addEventListener("click", () => {
    connectTasollerFamily();
  });

  document.querySelector("#connect-io4").addEventListener("click", () => {
    connectWith(() => new Io4WebHidAdapter());
  });

  document.querySelector("#connect-touch-com").addEventListener("click", () => {
    connectTouchCom();
  });

  document.querySelector("#disconnect-touch-com").addEventListener("click", () => {
    disconnectTouchCom();
  });

  document.querySelector("#connect-aime-reader").addEventListener("click", () => {
    connectSelectedAimeReader();
  });

  document.querySelector("#scan-aime-reader").addEventListener("click", () => {
    scanAimeReaderTimed();
  });

  ui.aimeReaderLedBrightness?.addEventListener("input", () => {
    updateReaderLedBrightnessLabel();
  });

  ui.aimeCardValue.addEventListener("click", (event) => {
    const copyButton = event.target.closest(".copy-card-number");
    if (copyButton) {
      copyAimeCardNumber(copyButton);
    }
  });

  document.querySelector("#send-aime-reader-led").addEventListener("click", () => {
    sendAimeReaderLedColor();
  });

  document.querySelector("#clear-aime-reader-led").addEventListener("click", () => {
    clearAimeReaderLedColor();
  });

  document.querySelector("#disconnect-aime-reader").addEventListener("click", () => {
    disconnectAimeReader();
  });

  document.querySelector("#disconnect").addEventListener("click", () => {
    disconnectCurrentDevice();
  });

  document.querySelector("#lights-solid").addEventListener("click", () => {
    sendLights("solid");
  });

  document.querySelector("#lights-active").addEventListener("click", () => {
    sendLights("active");
  });

  document.querySelector("#lights-clear").addEventListener("click", () => {
    sendLights("clear");
  });

  ui.optionsRestart.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      setOptionsStatusKey("options.status.reconnecting");
      await currentAdapter.restartOptionsMonitor();
      updateOptionsControls();
    } catch (error) {
      setOptionsStatus(t("options.error.restartFailed", { message: describeOptionsError(error) }));
    }
  });

  ui.optionsUseHid.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      setOptionsStatusKey("options.status.requestingPermission");
      await currentAdapter.startOptionsWebHid();
      updateOptionsControls();
    } catch (error) {
      setOptionsStatus(describeOptionsError(error));
    }
  });

  ui.optionsUseUsb.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      setOptionsStatusKey("options.status.requestingPermission");
      await currentAdapter.startOptionsWebUsb();
      updateOptionsControls();
    } catch (error) {
      setOptionsStatus(describeOptionsError(error));
    }
  });

  ui.optionsPollHid.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      await currentAdapter.pollOptions();
    } catch (error) {
      setOptionsStatus(t("options.error.pollFailed", { message: error.message || String(error) }));
    }
  });

  ui.optionsTriggerDbt.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      setOptionsStatusKey("options.status.sendingDbt");
      await currentAdapter.triggerOptionsDbt();
    } catch (error) {
      setOptionsStatus(t("options.error.dbtFailed", { message: error.message || String(error) }));
    }
  });

  ui.optionsStop.addEventListener("click", async () => {
    if (!currentAdapter || !currentAdapter.supportsOptionsTest()) {
      setOptionsStatusKey("options.error.noDevice");
      return;
    }

    try {
      await currentAdapter.stopOptionsMonitor();
    } catch (error) {
      setOptionsStatus(t("options.error.stopFailed", { message: error.message || String(error) }));
    }
  });

  ui.optionsClear.addEventListener("click", () => {
    clearOptionsLog();
    if (currentAdapter?.supportsOptionsTest()) {
      setOptionsStatusKey("options.status.logCleared");
    }
  });

  ui.touchThreshold.addEventListener("input", () => {
    setTouchThreshold(ui.touchThreshold.value);
  });

  ui.touchThresholdRange.addEventListener("input", () => {
    setTouchThreshold(ui.touchThresholdRange.value);
  });
}

function restoreSettings() {
  const savedThreshold = localStorage.getItem(TOUCH_THRESHOLD_STORAGE_KEY);
  if (savedThreshold !== null) {
    setTouchThreshold(savedThreshold);
  } else {
    setTouchThreshold(ui.touchThreshold.value);
  }
}

await loadLocale(localStorage.getItem(LANGUAGE_STORAGE_KEY) || navigator.language.toLowerCase());
buildGrid();
updateButtonLayout([]);
updateOptionsButtonLayout([]);
updateLightControls();
updateOptionsControls();
restoreSettings();
bindActions();
render();

