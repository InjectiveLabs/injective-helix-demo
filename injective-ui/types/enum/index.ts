export * from './market'
export * from './explorer'

export enum CtaToast {
  Telemetry = 'telemetry'
}

export enum GrantDirection {
  Grantee = 'grantee',
  Granter = 'granter'
}

export enum TimeDuration {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Second = 'second'
}

export enum NotificationType {
  Info = 'info',
  Error = 'error',
  Warning = 'warning',
  Success = 'success'
}

export enum SharedAmplitudeEvent {
  Login = 'Login',
  Logout = 'Logout',
  WalletSelected = 'Wallet Selected'
}

export enum CommonCyTags {
  NotificationTitle = 'notification-title',
  NotificationDescription = 'notification-description'
}

export enum WalletConnectStatus {
  idle = 'Idle',
  connected = 'Connected',
  connecting = 'Connecting',
  disconnected = 'Disconnected',
  disconnecting = 'disconnecting'
}

export enum EventBus {
  HasMagicAccount = 'has-magic-account',
  WalletConnected = 'wallet-connected',
  SubaccountChange = 'subaccount-change',
  WalletDisconnected = 'wallet-disconnected'
}

export enum UIBreakpoints {
  '2xs' = 375,
  xs = 480,
  sm = 640,
  md = 768,
  '2md' = 800,
  '3md' = 840,
  lg = 1024,
  xl = 1280,
  '2xl' = 1366,
  '3xl' = 1440,
  '4xl' = 1536,
  '5xl' = 1681,
  '6xl' = 1920
}

export enum NuxtUiIcons {
  Auction = 'ri:auction-fill',
  Apps = 'bi:grid-1x2-fill',
  Apps2 = 'bi:grid-fill',
  ArrowDiagonalRight = 'eva:diagonal-arrow-right-up-fill',
  ArrowLeft = 'fluent:arrow-left-12-regular',
  ArrowSwap = 'fontisto:arrow-swap',
  ArrowDown2 = 'bxs:down-arrow',
  Bank = 'bi:bank',
  BarChart = 'bi:bar-chart-line',
  BarChart2 = 'heroicons:chart-bar-16-solid',
  Bell = 'tabler:bell',
  Bitcoin = 'hugeicons:bitcoin-04',
  Box = 'mynaui:box-solid',
  BoxCircle = 'bi:bounding-box-circles',
  Bridge = 'fa6-solid:bridge',
  Calendar = 'bi:calendar-week',
  Calendar2 = 'bi:calendar',
  CandlestickChart = 'material-symbols:candlestick-chart-outline-rounded',
  Chain = 'akar-icons:link-chain',
  Checkmark = 'material-symbols:check-circle',
  Checkmark2 = 'icomoon-free:checkmark',
  CheckmarkCircle = 'material-symbols:check-circle',
  CheckmarkCircle2 = 'fluent:checkmark-circle-48-filled',
  CheckmarkThin = 'fluent:checkmark-20-filled',
  CheckmarkOutline = 'solar:check-circle-outline',
  CheckShieldOutline = 'stash:shield-check',
  ChevronDown = 'bi:chevron-down',
  ChevronDownCircle = 'fluent:chevron-circle-down-28-regular',
  ChevronLeft = 'bi:chevron-left',
  ChevronLeft2 = 'fa-solid:chevron-left',
  ChevronRight = 'bi:chevron-right',
  ChevronRight2 = 'fa-solid:chevron-right',
  ChevronUp = 'bi:chevron-up',
  ChevronUp2 = 'fa-solid:chevron-up',
  Circle = 'bi:circle-fill',
  CirclePlus = 'ep:circle-plus',
  CirclePlusFilled = 'ant-design:plus-circle-filled',
  ClockHistory = 'bi:clock-history',
  Close = 'flowbite:close-outline',
  CloseBold = 'ep:close-bold',
  CloudSlash = 'bi:cloud-slash',
  Code = 'tabler:code',
  Copy = 'bxs:copy-alt',
  Copy2 = 'clarity:copy-line',
  Copy3 = 'ic:baseline-content-copy',
  Copy4 = 'ic:outline-file-copy',
  ContractEdit = 'material-symbols-light:contract-edit-outline',
  Database = 'fa-solid:database',
  DashCircle = 'bi:dash-circle',
  Discord = 'ic:baseline-discord',
  DiscordWithBg = 'jam:discord',
  Download = 'fa6-solid:download',
  Download2 = 'material-symbols:download',
  ExitOutline = 'ion:exit-outline',
  Edit = 'material-symbols:edit-outline-rounded',
  EmptyData = 'i-heroicons-circle-stack-20-solid',
  Exit = 'bx:exit',
  ExternalLink = 'ooui:link-external-ltr',
  ExternalLink2 = 'mdi:external-link',
  Eye = 'heroicons:eye-16-solid',
  EyeSlash = 'heroicons:eye-slash-solid',
  Facebook = 'ic:baseline-facebook',
  Fire = 'ic:outline-whatshot',
  File = 'bi:file-text-fill',
  FileOutline = 'lucide:file-text',
  Filter = 'fluent:filter-32-filled',
  FourPointStar = 'mdi:star-four-points',
  FullScreen = 'tdesign:fullscreen',
  Gas = 'material-symbols:local-gas-station',
  Github = 'mdi:github',
  Globe = 'bi:globe',
  Globe2 = 'vaadin:globe',
  Globe3 = 'proicons:globe',
  Google = 'ri:google-fill',
  GoogleColor = 'devicon:google',
  Info = 'entypo:info-with-circle',
  Info2 = 'i-heroicons-information-circle',
  Info3 = 'healthicons:info-outline-24px',
  Injective = 'token:injective',
  Loading = 'eos-icons:loading',
  Markets = 'bi:bar-chart-steps',
  Menu = 'heroicons-outline:menu-alt-2',
  Menu2 = 'iconoir:menu',
  MenuDots = 'solar:menu-dots-bold',
  Notebook = 'lucide:notebook-text',
  Order = 'bi:list-nested',
  PieChart = 'bi:pie-chart',
  Plus = 'mdi:plus',
  PortfolioHistory = 'bi:clock',
  Position = 'bi:graph-up-arrow',
  PottedPlant = 'material-symbols:potted-plant-outline-rounded',
  QrCode = 'bx:qr',
  Refresh = 'el:refresh',
  Reddit = 'fa6-brands:reddit-alien',
  Robot = 'bi:robot',
  Robot2 = 'material-symbols:smart-toy-outline-rounded',
  Rocket = 'material-symbols-light:rocket',
  Rotate = 'fa:rotate-left',
  RotateAuto = 'material-symbols:rotate-auto',
  Search = 'ic:twotone-search',
  Settings = 'bi:gear-fill',
  SettingsOutline = 'bi:gear',
  Share = 'mage:share-fill',
  Share2 = 'ion:share-outline',
  Share3 = 'material-symbols-light:share-outline',
  Star = 'material-symbols:star',
  StarOutline = 'iconamoon:star-light',
  Stop = 'ph:prohibit',
  SubAccount = 'bi:grid',
  Telegram = 'file-icons:telegram',
  Telegram2 = 'ix:telegram-logo',
  TelegramCircle = 'cib:telegram',
  Trash = 'mdi:bin-outline',
  Trash2 = 'bi:trash',
  Trash3 = 'material-symbols:delete-outline',
  TriangleDown = 'bi:caret-down-fill',
  TriangleUp = 'bi:caret-up-fill',
  Trophy = 'bi:trophy-fill',
  Twitter = 'mdi:twitter',
  TwitterX = 'ri:twitter-x-line',
  TwitterNew = 'fa6-brands:x-twitter',
  TwitterCircle = 'formkit:twitter',
  UptrendChart = 'icon-park-outline:chart-line',
  User = 'mdi:user',
  UserOutline = 'mingcute:user-1-line',
  Warning = 'ep:warning-filled',
  Wallet = 'bi:wallet-fill',
  Wallet2 = 'bxs:wallet',
  Wallet3 = 'material-symbols:account-balance-wallet-outline',
  WarningOutline = 'fluent:warning-32-regular',
  WaterDrop = 'bi:droplet',
  Youtube = 'mdi:youtube',
  LoadingRotateDots = 'svg-spinners:8-dots-rotate'
}
